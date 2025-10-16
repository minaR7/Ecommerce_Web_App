const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

exports.sendInvoiceEmail = async (userInfo, orderInfo, orderItems) => {
  try {
    // 1️⃣ Generate invoice PDF
    const pdfPath = path.join(__dirname, `../invoices/invoice-${orderInfo.orderId}.pdf`);
    const doc = new PDFDocument({ margin: 50 });

    // Ensure invoices directory exists
    if (!fs.existsSync(path.join(__dirname, '../invoices'))) {
      fs.mkdirSync(path.join(__dirname, '../invoices'));
    }

    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // Header
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${orderInfo.orderId}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Customer Info
    doc.fontSize(12).text(`Customer: ${userInfo.firstName} ${userInfo.lastName}`);
    doc.text(`Email: ${userInfo.email}`);
    doc.moveDown();

    // Order Table
    doc.text('Items:', { underline: true });
    doc.moveDown(0.5);

    orderItems.forEach(item => {
      doc.text(`${item.name} (x${item.quantity}) - €${item.basePrice * item.quantity}`);
    });

    doc.moveDown(1);
    doc.text(`Shipping: €35.00`);
    if (orderInfo.discount) {
      doc.text(`Discount: -€${((orderInfo.subtotal * orderInfo.discount) / 100).toFixed(2)}`);
    }
    doc.fontSize(14).text(`Total: €${orderInfo.total.toFixed(2)}`, { align: 'right' });

    doc.end();

    // Wait until PDF is finished writing
    await new Promise((resolve) => writeStream.on('finish', resolve));

    // 2️⃣ Send invoice via email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Your Store" <${process.env.SMTP_USER}>`,
      to: userInfo.email,
      subject: `Invoice for Order #${orderInfo.orderId}`,
      text: `Hi ${userInfo.firstName},\n\nThank you for your order! Please find your invoice attached.\n\n- The Store Team`,
      attachments: [
        {
          filename: `invoice-${orderInfo.orderId}.pdf`,
          path: pdfPath,
        },
      ],
    });

    console.log('✅ Invoice sent to', userInfo.email);
    return { success: true, message: 'Invoice sent successfully' };
  } catch (error) {
    console.error('Error sending invoice:', error);
    return { success: false, message: error.message };
  }
};
