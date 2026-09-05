const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// ── Brand ────────────────────────────────────────────────────────────────────
const NAVY = '#15203a';
const AMBER = '#d99a2b';
const MUTED = '#6b7280';
const LOGO_PATH = path.join(__dirname, '../assets/email/logo.png');
const LOGO_CID = 'elmaghrib-logo';

const eur = (v) => `€${Number(v || 0).toFixed(2)}`;

// Single place for the SMTP transporter so invoice + status emails stay in sync.
const createTransporter = () => {
  // See userController.js makeTransporter() for full TLS docs.  The mail server
  // on mail.Elmaghrib.com:465 currently has an expired TLS cert; set env
  // SMTP_TLS_STRICT=false to temporarily allow delivery without validating the
  // TLS chain (this works, but the correct fix is to renew the cert).
  const strictTls =
    process.env.SMTP_TLS_STRICT === undefined
      ? true
      : String(process.env.SMTP_TLS_STRICT).toLowerCase() !== 'false';

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    greetingTimeout: 10000,
    connectionTimeout: 15000,
    socketTimeout: 15000,
    logger: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production',
    tls: {
      rejectUnauthorized: strictTls,
      minVersion: strictTls ? undefined : 'TLSv1',
    },
  });
};

// Attach the logo (referenced by CID in the HTML) when the file is present.
const logoAttachment = () =>
  fs.existsSync(LOGO_PATH)
    ? [{ filename: 'logo.png', path: LOGO_PATH, cid: LOGO_CID }]
    : [];

// ── Branded HTML shell ────────────────────────────────────────────────────────
// Wraps body content in a responsive, email-client-friendly layout (inline styles,
// table-based) with the El-Maghrib logo header and a footer.
const emailShell = (bodyHtml) => `
  <div style="margin:0;padding:0;background:#f4f4f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
          style="width:600px;max-width:92%;background:#ffffff;border-radius:14px;overflow:hidden;
                 box-shadow:0 6px 24px rgba(21,32,58,0.08);font-family:Arial,Helvetica,sans-serif;color:${NAVY};">
          <!-- Header -->
          <tr><td align="center" style="padding:28px 24px 12px;">
            <img src="cid:${LOGO_CID}" alt="El-Maghrib" width="180"
              style="display:block;max-width:180px;height:auto;" />
          </td></tr>
          <tr><td style="padding:0 24px;"><div style="height:3px;background:${AMBER};border-radius:3px;"></div></td></tr>
          <!-- Body -->
          <tr><td style="padding:24px 32px 8px;font-size:15px;line-height:1.6;color:#1f2937;">
            ${bodyHtml}
          </td></tr>
          <!-- Footer -->
          <tr><td style="padding:20px 32px 28px;">
            <div style="border-top:1px solid #eee;padding-top:16px;font-size:12px;line-height:1.6;color:${MUTED};text-align:center;">
              <p style="margin:0 0 4px;font-weight:bold;color:${NAVY};">El-Maghrib — Reviving the Sunnah</p>
              <p style="margin:0;">Authentic Moroccan fashion, handcrafted for every occasion.</p>
              <p style="margin:8px 0 0;">Need help? Reply to this email and our team will assist you.</p>
            </div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </div>`;

// Styled items table (shared by invoice + status emails). Accepts items with
// { name, quantity, basePrice|price }.
const renderItemsTable = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) return '';
  const rows = items.map((it) => {
    const unit = Number(it.basePrice ?? it.price ?? 0);
    const qty = Number(it.quantity ?? 1);
    return `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1f2937;">${it.name || 'Product'}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1f2937;text-align:center;">${qty}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1f2937;text-align:right;">${eur(unit)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1f2937;text-align:right;font-weight:bold;">${eur(unit * qty)}</td>
      </tr>`;
  }).join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 4px;">
      <thead>
        <tr style="background:${NAVY};">
          <th align="left"  style="padding:10px 8px;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#fff;">Item</th>
          <th align="center"style="padding:10px 8px;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#fff;">Qty</th>
          <th align="right" style="padding:10px 8px;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#fff;">Price</th>
          <th align="right" style="padding:10px 8px;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#fff;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
};

const totalsBlock = ({ subtotal, shipping, discount, total }) => {
  const line = (label, value, opts = {}) => `
    <tr>
      <td style="padding:4px 8px;font-size:14px;color:${opts.bold ? NAVY : '#374151'};text-align:right;${opts.bold ? 'font-weight:bold;' : ''}">${label}</td>
      <td style="padding:4px 8px;font-size:${opts.bold ? '16px' : '14px'};color:${opts.color || '#111827'};text-align:right;width:110px;${opts.bold ? 'font-weight:bold;' : ''}">${value}</td>
    </tr>`;
  const discountAmt = discount ? (Number(subtotal) * Number(discount)) / 100 : 0;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
      <tr><td>
        <table role="presentation" align="right" cellpadding="0" cellspacing="0" style="min-width:260px;">
          ${subtotal != null ? line('Subtotal', eur(subtotal)) : ''}
          ${shipping != null ? line('Shipping', eur(shipping)) : ''}
          ${discount ? line(`Discount (${discount}%)`, `-${eur(discountAmt)}`, { color: '#16a34a' }) : ''}
          <tr><td colspan="2" style="padding:0 8px;"><div style="border-top:2px solid ${NAVY};margin:6px 0;"></div></td></tr>
          ${line('Total', eur(total), { bold: true })}
        </table>
      </td></tr>
    </table>`;
};

// ── Invoice PDF ────────────────────────────────────────────────────────────────
const buildInvoicePdf = (pdfPath, userInfo, orderInfo, orderItems) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      const pageLeft = 50;
      const pageRight = doc.page.width - 50; // ~545
      const contentW = pageRight - pageLeft;

      // Header: logo (left) + INVOICE (right)
      let headerBottom = 60;
      if (fs.existsSync(LOGO_PATH)) {
        try { doc.image(LOGO_PATH, pageLeft, 45, { width: 150 }); headerBottom = 110; } catch { /* ignore */ }
      }
      doc.fillColor(NAVY).fontSize(26).font('Helvetica-Bold').text('INVOICE', pageLeft, 52, { align: 'right' });
      doc.fillColor(MUTED).fontSize(10).font('Helvetica')
        .text(`Order #${orderInfo.orderId}`, pageLeft, 84, { align: 'right' })
        .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });

      // Accent divider
      let y = headerBottom + 6;
      doc.rect(pageLeft, y, contentW, 3).fill(AMBER);
      y += 22;

      // Billed to
      doc.fillColor(NAVY).fontSize(11).font('Helvetica-Bold').text('BILLED TO', pageLeft, y);
      y += 16;
      doc.fillColor('#374151').fontSize(11).font('Helvetica')
        .text(`${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || 'Customer', pageLeft, y);
      y += 15;
      if (userInfo.email) { doc.text(userInfo.email, pageLeft, y); y += 15; }
      y += 12;

      // Items table header
      const colItem = pageLeft;
      const colQty = pageLeft + 300;
      const colUnit = pageLeft + 360;
      const colTotal = pageRight - 90;
      doc.rect(pageLeft, y, contentW, 22).fill(NAVY);
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
      doc.text('ITEM', colItem + 8, y + 6);
      doc.text('QTY', colQty, y + 6, { width: 50, align: 'center' });
      doc.text('PRICE', colUnit, y + 6, { width: 70, align: 'right' });
      doc.text('TOTAL', colTotal, y + 6, { width: 90, align: 'right' });
      y += 22;

      // Rows
      doc.font('Helvetica').fontSize(10);
      (orderItems || []).forEach((it, i) => {
        const unit = Number(it.basePrice ?? it.price ?? 0);
        const qty = Number(it.quantity ?? 1);
        const rowH = 22;
        if (i % 2 === 1) doc.rect(pageLeft, y, contentW, rowH).fill('#f7f7f8');
        doc.fillColor('#1f2937');
        doc.text(it.name || 'Product', colItem + 8, y + 6, { width: 280 });
        doc.text(String(qty), colQty, y + 6, { width: 50, align: 'center' });
        doc.text(eur(unit), colUnit, y + 6, { width: 70, align: 'right' });
        doc.fillColor(NAVY).font('Helvetica-Bold').text(eur(unit * qty), colTotal, y + 6, { width: 90, align: 'right' });
        doc.font('Helvetica');
        y += rowH;
      });

      // Totals
      y += 12;
      const labelX = pageRight - 250;
      const valX = pageRight - 90;
      const totalsLine = (label, value, bold) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 13 : 11)
          .fillColor(bold ? NAVY : '#374151')
          .text(label, labelX, y, { width: 150, align: 'right' })
          .fillColor(bold ? NAVY : '#111827')
          .text(value, valX, y, { width: 90, align: 'right' });
        y += bold ? 22 : 18;
      };
      if (orderInfo.subtotal != null) totalsLine('Subtotal', eur(orderInfo.subtotal));
      totalsLine('Shipping', eur(orderInfo.shipping));
      if (orderInfo.discount) {
        totalsLine(`Discount (${orderInfo.discount}%)`, `-${eur((Number(orderInfo.subtotal) * Number(orderInfo.discount)) / 100)}`);
      }
      doc.moveTo(labelX, y).lineTo(pageRight, y).lineWidth(1.5).strokeColor(NAVY).stroke();
      y += 8;
      totalsLine('Total', eur(orderInfo.total), true);

      // Footer
      doc.fillColor(MUTED).font('Helvetica').fontSize(10)
        .text('Thank you for shopping with El-Maghrib — Reviving the Sunnah.', pageLeft, doc.page.height - 80, { align: 'center', width: contentW });

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });

// ── Invoice email ───────────────────────────────────────────────────────────────
exports.sendInvoiceEmail = async (userInfo, orderInfo, orderItems) => {
  try {
    const pdfPath = path.join(__dirname, `../invoices/invoice-${orderInfo.orderId}.pdf`);
    if (!fs.existsSync(path.join(__dirname, '../invoices'))) {
      fs.mkdirSync(path.join(__dirname, '../invoices'));
    }
    await buildInvoicePdf(pdfPath, userInfo, orderInfo, orderItems);

    const body = `
      <p style="margin:0 0 6px;font-size:18px;font-weight:bold;color:${NAVY};">Thank you for your order, ${userInfo.firstName || 'there'}!</p>
      <p style="margin:0 0 16px;color:#4b5563;">Your order <strong>#${orderInfo.orderId}</strong> has been confirmed. A copy of your invoice is attached as a PDF.</p>
      ${renderItemsTable(orderItems)}
      ${totalsBlock(orderInfo)}
      <p style="margin:20px 0 0;color:#4b5563;">We'll email you again as your order progresses. Thank you for shopping with us.</p>
    `;

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"El-Maghrib" <${process.env.SMTP_USER}>`,
      to: userInfo.email,
      subject: `Your El-Maghrib Invoice — Order #${orderInfo.orderId}`,
      text: `Hi ${userInfo.firstName || ''},\n\nThank you for your order #${orderInfo.orderId}! Your invoice is attached.\n\nTotal: ${eur(orderInfo.total)}\n\n- The El-Maghrib Team`,
      html: emailShell(body),
      attachments: [
        { filename: `invoice-${orderInfo.orderId}.pdf`, path: pdfPath },
        ...logoAttachment(),
      ],
    });

    console.log('Invoice sent to', userInfo.email);
    return { success: true, message: 'Invoice sent successfully' };
  } catch (error) {
    console.error('Error sending invoice:', error);
    return { success: false, message: error.message };
  }
};

// ── Order status email ────────────────────────────────────────────────────────
// Sent to the customer whenever an admin changes their order's status. Optionally
// includes the order items when provided by the caller.
exports.sendOrderStatusEmail = async (userInfo, orderId, status, orderItems = []) => {
  try {
    if (!userInfo?.email) return { success: false, message: 'No recipient email' };
    const prettyStatus = String(status || '').replace(/_/g, ' ');
    const statusColors = {
      pending: '#d97706', processing: '#2563eb', shipped: '#0891b2',
      delivered: '#16a34a', cancelled: '#dc2626',
    };
    const badgeColor = statusColors[String(status).toLowerCase()] || NAVY;

    const body = `
      <p style="margin:0 0 6px;font-size:18px;font-weight:bold;color:${NAVY};">Hi ${userInfo.firstName || 'there'},</p>
      <p style="margin:0 0 14px;color:#4b5563;">There's an update on your order <strong>#${orderId}</strong>:</p>
      <p style="margin:0 0 18px;">
        <span style="display:inline-block;padding:8px 16px;border-radius:999px;background:${badgeColor};color:#fff;
                     font-weight:bold;text-transform:capitalize;font-size:14px;">${prettyStatus}</span>
      </p>
      ${renderItemsTable(orderItems)}
      <p style="margin:18px 0 0;color:#4b5563;">Thank you for shopping with us. We'll keep you posted on any further updates.</p>
    `;

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"El-Maghrib" <${process.env.SMTP_USER}>`,
      to: userInfo.email,
      subject: `Update on your Order #${orderId} — ${prettyStatus}`,
      text: `Hi ${userInfo.firstName || ''},\n\nYour order #${orderId} status has been updated to: ${prettyStatus}.\n\nThank you for shopping with us.\n\n- The El-Maghrib Team`,
      html: emailShell(body),
      attachments: logoAttachment(),
    });
    console.log('Order status email sent to', userInfo.email);
    return { success: true };
  } catch (error) {
    console.error('Error sending order status email:', error);
    return { success: false, message: error.message };
  }
};
