// Single support/contact address used in customer emails and site defaults.
// Customer replies to any email go here.
const SUPPORT_EMAIL = 'info@elmaghrib.com';

// Address every outgoing email (signup, password reset, invoice, order status)
// is sent from. Override with MAIL_FROM in the server env if it ever changes.
// SMTP_USER/SMTP_PASS should be this mailbox's login, or the mail server may
// reject or spam-flag mail "from" an address the login doesn't own.
const MAIL_FROM = process.env.MAIL_FROM || SUPPORT_EMAIL;

module.exports = { SUPPORT_EMAIL, MAIL_FROM };
