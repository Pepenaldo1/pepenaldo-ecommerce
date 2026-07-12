const nodemailer = require('nodemailer');

// Works with any SMTP provider (Gmail app password, SendGrid, Mailgun, etc).
// Configure via env vars — see .env.example.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG')}`;
}

function itemsToHtml(items) {
  return items
    .map(
      (i) =>
        `<tr>
           <td style="padding:6px 10px;border-bottom:1px solid #eee;">${i.product_name}</td>
           <td style="padding:6px 10px;border-bottom:1px solid #eee;">${i.quantity}</td>
           <td style="padding:6px 10px;border-bottom:1px solid #eee;">${formatNaira(i.unit_price)}</td>
         </tr>`
    )
    .join('');
}

async function sendAdminNewOrderEmail(order, items) {
  const html = `
    <h2>New order received — #${order.id.slice(0, 8)}</h2>
    <p><strong>Total:</strong> ${formatNaira(order.total_amount)}</p>
    <p><strong>Shipping address:</strong> ${order.shipping_address}</p>
    <p><strong>Phone:</strong> ${order.shipping_phone}</p>
    <table style="border-collapse:collapse;width:100%;">
      <thead>
        <tr>
          <th style="text-align:left;padding:6px 10px;">Item</th>
          <th style="text-align:left;padding:6px 10px;">Qty</th>
          <th style="text-align:left;padding:6px 10px;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsToHtml(items)}</tbody>
    </table>
  `;
  await transporter.sendMail({
    from: `"Pepenaldo" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New order #${order.id.slice(0, 8)} — ${formatNaira(order.total_amount)}`,
    html,
  });
}

async function sendCustomerConfirmationEmail(customerEmail, order, items) {
  const html = `
    <h2>Thanks for your order!</h2>
    <p>Your order <strong>#${order.id.slice(0, 8)}</strong> has been received and is being processed.</p>
    <table style="border-collapse:collapse;width:100%;">
      <thead>
        <tr>
          <th style="text-align:left;padding:6px 10px;">Item</th>
          <th style="text-align:left;padding:6px 10px;">Qty</th>
          <th style="text-align:left;padding:6px 10px;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsToHtml(items)}</tbody>
    </table>
    <p style="margin-top:16px;"><strong>Total: ${formatNaira(order.total_amount)}</strong></p>
    <p>We'll email you again once your order ships.</p>
  `;
  await transporter.sendMail({
    from: `"Pepenaldo" <${process.env.SMTP_USER}>`,
    to: customerEmail,
    subject: `Order confirmed — #${order.id.slice(0, 8)}`,
    html,
  });
}

module.exports = { sendAdminNewOrderEmail, sendCustomerConfirmationEmail };
