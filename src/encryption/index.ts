import crypto from 'crypto';

const KEY = process.env.ENCRYPTION_KEY;
const IV = process.env.ENCRYPTION_IV;

export default function encrypt(data: string): string {
  if (!KEY || !IV) {
    throw new Error('Encryption key and/or initialization vector not found!');
  }

  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, IV);
  const encrypted = cipher.update(data, 'utf8', 'base64');

  return encrypted + cipher.final('base64');
}
