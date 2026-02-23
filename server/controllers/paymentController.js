const sql = require('mssql');
// POST /api/charge
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// app.post('/api/charge', async (req, res) => {
//   try {
//     const { amount, paymentMethodId } = req.body;

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency: 'usd',
//       payment_method: paymentMethodId,
//       confirm: true,
//     });

//     res.status(200).json({ success: true, paymentIntent });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

exports.createIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    const amountInCents = Math.round(Number(amount) * 100);
    if (!amountInCents || amountInCents <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const intent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always',
      },
    });
    res.status(200).json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
  } catch (error) {
    console.error('Create intent error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.savePayment = async (orderId, paymentIntent) => {
  try {
    console.log("paymentIntent", paymentIntent)
    await sql.query`
      INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_id, created_at)
      VALUES (
        ${orderId},
        ${paymentIntent.amount / 100},
        ${paymentIntent.payment_method_types?.[0] || 'unknown'},
        ${paymentIntent.status},
        ${paymentIntent.id},
        GETDATE()
      )
    `;
    return { success: true };
  } catch (err) {
    console.error('Error saving payment:', err);
    return { success: false, message: err.message };
  }
};
