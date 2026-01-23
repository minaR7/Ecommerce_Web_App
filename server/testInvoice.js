require('dotenv').config(); // load .env values
const { sendInvoiceEmail } = require('./controllers/invoiceController.js'); // adjust the path

(async () => {
  try {
    const userInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'syedamominarashid752@gmail.com', // ← put your real email here for testing
    };

    const orderInfo = {
      orderId: '123456',
      subtotal: 200,
      discount: 10, // in %
      total: 215, // after discount + shipping
    };

    const orderItems = [
      { name: 'Leather Jacket', quantity: 1, basePrice: 150 },
      { name: 'Shoes', quantity: 1, basePrice: 50 },
    ];

    console.log('Testing invoice email sending...');
    const result = await sendInvoiceEmail(userInfo, orderInfo, orderItems);
    console.log('Result:', result);
  } catch (err) {
    console.error('Test failed:', err);
  }
})();
