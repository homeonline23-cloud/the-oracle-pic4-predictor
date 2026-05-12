import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(email: string, password?: string, tier?: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Welcome to The Oracle Pic 4!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #2563eb; text-align: center;">Welcome to The Oracle!</h1>
        <p>Thank you for subscribing to our <strong>${tier?.toUpperCase()}</strong> plan.</p>
        
        ${password ? `
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin-top: 0;">We have created an account for you. Here are your login credentials:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 4px; border-radius: 4px;">${password}</span></p>
            <p style="font-size: 12px; color: #64748b;">(You can change your password anytime in your account settings after logging in.)</p>
          </div>
        ` : `
          <p>Your account has been successfully upgraded to the <strong>${tier}</strong> tier.</p>
        `}
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ais-dev-hdrkvclzmibrypoi57ctky-438166421289.europe-west2.run.app'}/login" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; rounded: 6px; font-weight: bold;">
            Login to Your Account
          </a>
        </div>
        
        <p style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center;">
          If you have any questions, please reply to this email.
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
