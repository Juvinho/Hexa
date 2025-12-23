import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// In a real production app, this should be a 32-byte key from .env
// For this MVP, we derive it or use a default if missing
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') 
  : crypto.createHash('sha256').update(process.env.JWT_SECRET || 'secret-key-fallback').digest();
  
const IV_LENGTH = 16;

export const encryption = {
  encrypt: (text: string) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { 
      iv: iv.toString('hex'), 
      encryptedData: encrypted.toString('hex') 
    };
  },

  decrypt: (text: string, ivHex: string) => {
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(text, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
};
