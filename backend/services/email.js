import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inboxDir = path.join(__dirname, '..', 'inbox_mock');

export const sendMockEmail = async ({ to, subject, body, from = 'no-reply@company.com' }) => {
  try {
    if (!fs.existsSync(inboxDir)) {
      fs.mkdirSync(inboxDir, { recursive: true });
    }

    const emailPayload = {
      id: `mail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      subject,
      body,
      timestamp: new Date().toISOString()
    };

    const fileName = `email_${Date.now()}_${emailPayload.id.split('_')[2]}.json`;
    const filePath = path.join(inboxDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(emailPayload, null, 2));

    console.log(`[Mock Email Sent] To: ${to} | Subject: ${subject}`);
    return true;
  } catch (error) {
    console.error('Failed to send mock email:', error);
    return false;
  }
};
