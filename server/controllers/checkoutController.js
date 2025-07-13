const sql = require('mssql');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { saveUser } = require('./userController');
const {saveOrder, saveOrderItems} = require('./orderController');
const {saveShipping} = require('./shippingController');
const {saveBilling} = require('./billingController');
const { savePayment } = require('./paymentController');
const {updateProductStock} = require('./inventoryController');
const {markCartItemsAsProcessed, checkAndAdjustCartItems} = require('./addToCartController')

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

      // Convert total amount based on updated cart
      const updatedTotalAmount = updatedCartItems.reduce(
        (sum, item) => sum + item.basePrice * item.quantity,
        0
      );
      
      // convert total amount to cents
      // const amountInCents = Math.round(payload.totalAmount * 100);
      const amountInCents = Math.round(updatedTotalAmount * 100);
        // Call Stripe Payment Intent
      const paymentResponse = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'eur', //usd, pkr
          payment_method: payload.paymentMethodId,
          // payment_method_types: ['card'], // optional if you want only card
          // return_url: 'https://your-site.com/checkout/complete', // Add your success URL here
          confirm: true,
          automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never', // This avoids redirect-based payments
          },
      });

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
      const orderResult = await saveOrder({ userId, totalAmount: updatedTotalAmount });
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

      // Save Payment Info
      const paymentSaveResult = await savePayment(orderId, paymentResponse);
      if (!paymentSaveResult.success) {
      return res.status(400).json({ success: false, message: 'Failed to save payment info' });
      }

      // Update stock quantity
      const stockUpdateResult = await updateProductStock(updatedCartItems);
      if (!stockUpdateResult.success) {
        return res.status(400).json({ success: false, message: stockUpdateResult.message });
      }

      // Mark cart items as processed
      const processCartItemsResult = await markCartItemsAsProcessed(userId, updatedCartItems);
      if (!processCartItemsResult.success) {
        return res.status(400).json({ success: false, message: processCartItemsResult.message });
      }

    // Return response
    return res.status(200).json({ success: true, message: 'Order placed successfully', orderId, paymentIntent: paymentResponse,
      stockMessages: stockCheck.stockMessages, order_items: updatedCartItems });
  } catch (error) {
      console.error('Checkout error:', error);
      res.status(400).json({ error: error.message });
  }
};
