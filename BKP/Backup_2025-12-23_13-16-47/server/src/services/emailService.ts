export const emailService = {
  async sendEmail(to: string, subject: string, html: string) {
    console.log(`[Email Service] Sending email to ${to}`);
    console.log(`[Email Service] Subject: ${subject}`);
    // console.log(`[Email Service] Body: ${html}`);
    // In production, integrate with SendGrid/AWS SES/etc.
    return true;
  },

  getVerificationTemplate(url: string) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Verifique seu e-mail</h2>
        <p>Bem-vindo ao Hexa Dashboard! Por favor, clique no botão abaixo para verificar seu endereço de e-mail.</p>
        <a href="${url}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Verificar E-mail</a>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">Se você não criou uma conta, por favor ignore este e-mail.</p>
      </div>
    `;
  },

  getPasswordResetTemplate(url: string) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Redefinição de Senha</h2>
        <p>Você solicitou a redefinição de senha. Clique no botão abaixo para escolher uma nova senha.</p>
        <a href="${url}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Redefinir Senha</a>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">Este link expira em 1 hora. Se você não solicitou isso, por favor ignore este e-mail.</p>
      </div>
    `;
  }
};
