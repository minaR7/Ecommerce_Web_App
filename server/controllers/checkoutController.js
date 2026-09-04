const sql = require('mssql');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { saveUser } = require('./userController');
const {saveOrder, saveOrderItems} = require('./orderController');
const {saveShipping} = require('./shippingController');
const {saveBilling} = require('./billingController');
const { savePayment } = require('./paymentController');
const {updateProductStock} = require('./inventoryController');
const {markCartItemsAsProcessed, checkAndAdjustCartItems} = require('./addToCartController')
const {sendInvoiceEmail}= require('./invoiceController')
const { notifyAdmins } = require('../services/notificationService');
const { loadSettings } = require('./siteSettingsController');

exports.doCheckout = async (req, res) => {
  try {
      const { payload } = req.body;
      console.log("payload",payload)
      
      // Step 1: Check stock
      const stockCheck = await checkAndAdjustCartItems(payload.cartItems);
      
      if (!stockCheck.success) {
        return res.status(400).json({
          success: false,
          message: stockCheck.message,
          stockMessages: stockCheck.stockMessages,
        });
      }

      const updatedCartItems = stockCheck.adjustedCartItems;
      console.log("updatedCartItems", updatedCartItems)

      // Convert subtotal based on updated cart
      const updatedSubtotal = updatedCartItems.reduce(
        (sum, item) => sum + item.basePrice * item.quantity,
        0
      );
      // Compute shipping fee by country. Fallback = admin-configured default
      // international rate (site settings), defaulting to 35 EUR if unset.
      const defaultShippingFee = Number(loadSettings().default_intl_shipping_fee);
      const fallbackShippingFee = Number.isFinite(defaultShippingFee) ? defaultShippingFee : 35;
      const shippingCountry = payload?.shipping?.country;
      let shippingFee = fallbackShippingFee;
      if (shippingCountry) {
        try {
          const feeResult = await sql.query`
            SELECT TOP 1 fee FROM shipping_rates
            WHERE LOWER(country) = LOWER(${shippingCountry}) AND status = 'active'
          `;
          if (feeResult.recordset.length > 0) {
            shippingFee = Number(feeResult.recordset[0].fee);
          } else {
            shippingFee = fallbackShippingFee;
          }
        } catch (e) {
          shippingFee = fallbackShippingFee;
        }
      }
      //      // convert total amount to cents
      // // const amountInCents = Math.round(payload.totalAmount * 100);
      // const amountInCents = Math.round((updatedSubtotal + shippingFee) * 100);
      //   // Call Stripe Payment Intent
      // const paymentResponse = await stripe.paymentIntents.create({
      //     amount: amountInCents,
      //     currency: 'eur', //usd, pkr
      //     payment_method: payload.paymentMethodId,
      //     // payment_method_types: ['card'], // optional if you want only card
      //     // return_url: 'https://your-site.com/checkout/complete', // Add your success URL here
      //     confirm: true,
      //     automatic_payment_methods: {
      //     enabled: true,
      //     // allow_redirects: 'never', // This avoids redirect-based payments
      //     allow_redirects: 'always',
      //     },
      // }); 
      // Client should have confirmed payment already; verify intent
      if (!payload.paymentIntentId) {
        return res.status(400).json({ success: false, message: 'Missing paymentIntentId' });
      }
      const paymentResponse = await stripe.paymentIntents.retrieve(payload.paymentIntentId);
      if (paymentResponse.status !== 'succeeded') {
        return res.status(400).json({ success: false, message: 'Payment not confirmed' });
      }

      // Save User
      const userResult = await saveUser(payload.user_info, true);
      // Handle error from saveUser
      if (!userResult?.user_id) {
        return res.status(userResult.status || 400).json({
          success: false,
          message: userResult.message || 'Failed to create user',
        });
      }
      const userId = userResult.user_id;
      console.log("userId",userId)
      
      // Save Order
      const orderResult = await saveOrder({ userId, totalAmount: updatedSubtotal + shippingFee });
      if (!orderResult?.order_id) {
        return res.status(orderResult.status || 400).json({
          success: false,
          message: orderResult.message || 'Failed to add order',
        });
      }
      const orderId = orderResult.order_id;
      console.log("order_id", orderId)

      // Save Billing and Shipping
      const shippingRes = await saveShipping({ orderId, shippingDetails: payload.shipping });
      if (!shippingRes?.success) {
        return res.status(shippingRes.status || 400).json({
          success: false,
          message: shippingRes.message || 'Failed to add shipping info',
        });
      }

      const billingRes = await saveBilling({ orderId, billingDetails: payload.billing,});
      if (!billingRes?.success) {
        return res.status(billingRes.status || 400).json({
          success: false,
          message: billingRes.message || 'Failed to add shipping info',
        });
      }
      
    //   console.log(shippingRes, billingRes, 'all saved')

      // Save Order Items
      const orderItemsResult = await saveOrderItems(orderId, updatedCartItems);
      if (!orderItemsResult.success) {
      return res.status(400).json({ success: false, message: 'Failed to save order items' });
      }

      // Save Payment Info. This payments row (payment_status = 'succeeded') is now the
      // single source of truth for whether an order is paid — the orders table no
      // longer carries a payment_status column.
      const paymentSaveResult = await savePayment(orderId, paymentResponse);
      if (!paymentSaveResult.success) {
      return res.status(400).json({ success: false, message: 'Failed to save payment info' });
      }

      // Increment coupon usage on successful order (best-effort; the WHERE guard
      // keeps used_count from exceeding usage_limit under concurrent checkouts).
      if (payload.couponCode) {
        try {
          const upd = await sql.query`
            UPDATE coupons
            SET used_count = ISNULL(used_count, 0) + 1, updated_at = GETDATE()
            OUTPUT INSERTED.coupon_id, INSERTED.code, INSERTED.usage_limit, INSERTED.used_count
            WHERE LOWER(code) = LOWER(${payload.couponCode})
              AND (usage_limit IS NULL OR ISNULL(used_count, 0) < usage_limit)
          `;
          // If this order pushed the coupon to its limit, alert admins so they can
          // deactivate or delete it from the notification.
          const c = upd.recordset[0];
          if (c && c.usage_limit != null && c.used_count >= c.usage_limit) {
            await notifyAdmins({
              type: 'coupon_limit_reached',
              title: 'Coupon usage limit reached',
              message: `Coupon "${c.code}" has reached its usage limit (${c.used_count}/${c.usage_limit}). Deactivate or delete it?`,
              meta: { couponId: c.coupon_id, code: c.code }
            });
          }
        } catch (e) {
          console.error('Failed to increment coupon usage', e);
        }
      }

      // Update stock quantity
      const stockUpdateResult = await updateProductStock(updatedCartItems);
      if (!stockUpdateResult.success) {
        return res.status(400).json({ success: false, message: stockUpdateResult.message });
      }

      // Step 11: Mark cart items as processed
      const processCartItemsResult = await markCartItemsAsProcessed(userId, updatedCartItems);
      if (!processCartItemsResult.success) {
        return res.status(400).json({ success: false, message: processCartItemsResult.message });
      }

      // After all database saves succeed
      const orderSummary = {
        orderId,
        subtotal: updatedSubtotal,
        shipping: shippingFee,
        total: updatedSubtotal + shippingFee, // or handle discount if applied
        discount: payload.discount || 0
      };

      await notifyAdmins({
        type: 'order_created',
        title: 'New order created',
        message: `Order #${orderId} placed`,
        meta: { orderId, userId, total: orderSummary.total }
      });
      await sendInvoiceEmail(payload.user_info, orderSummary, updatedCartItems);

    // Return response
    return res.status(200).json({ success: true, message: 'Order placed successfully', orderId, paymentIntent: paymentResponse,
      stockMessages: stockCheck.stockMessages, order_items: updatedCartItems });
  } catch (error) {
      console.error('Checkout error:', error);
      res.status(400).json({ error: error.message });
  }
};
