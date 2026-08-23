import nodemailer from 'nodemailer';

// SMTP Ayarları
// ÖNEMLİ: Bu ayarların çalışması için kullanıcının .env dosyasına SMTP değişkenlerini eklemesi gerekir.
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // port 465 için true, diğerleri için false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, code: string) {
  const mailOptions = {
    from: `"Thendisch" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: "Thendisch - Hesabınızı Doğrulayın",
    html: `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0B0C10; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #121318; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; }
          .header { text-align: center; padding: 40px 20px; background: linear-gradient(to bottom, #1A1C23, transparent); border-bottom: 1px solid rgba(255,255,255,0.05); }
          .title { font-size: 24px; font-weight: 900; letter-spacing: -1px; margin: 0; }
          .subtitle { font-family: monospace; font-size: 10px; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase; margin-top: 8px; }
          .content { padding: 40px 30px; text-align: center; }
          .greeting { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #fff; }
          .message { color: #888; font-size: 14px; line-height: 1.6; margin-bottom: 35px; }
          .code-box { background-color: #050505; border: 1px dashed rgba(212,175,55,0.3); padding: 25px; border-radius: 15px; display: inline-block; }
          .code { font-family: monospace; font-size: 42px; font-weight: bold; letter-spacing: 8px; color: #D4AF37; margin: 0; text-shadow: 0 0 15px rgba(212,175,55,0.3); }
          .warning { font-size: 12px; color: #555; margin-top: 35px; }
          .footer { padding: 20px; text-align: center; background-color: #050505; border-top: 1px solid rgba(255,255,255,0.05); font-size: 11px; color: #444; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">THENDISCH</h1>
            <div class="subtitle">Acoustics</div>
          </div>
          <div class="content">
            <div class="greeting">Hoş Geldiniz,</div>
            <div class="message">
              Thendisch'e kayıt olduğunuz için teşekkür ederiz. Müzik odamıza giriş yapabilmeniz ve ayrıcalıklardan yararlanabilmeniz için e-posta adresinizi doğrulamanız gerekmektedir. Aşağıdaki 6 haneli kodu kullanarak işleminizi tamamlayabilirsiniz.
            </div>
            <div class="code-box">
              <p class="code">${code}</p>
            </div>
            <div class="warning">
              Bu kod 15 dakika boyunca geçerlidir. Kayıt işlemini siz yapmadıysanız lütfen bu e-postayı dikkate almayın.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Thendisch. Tüm Hakları Saklıdır.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("E-posta başarıyla gönderildi:", info.messageId);
    return true;
  } catch (error) {
    console.error("E-posta gönderim hatası:", error);
    return false;
  }
}
