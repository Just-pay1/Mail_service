import express, { Request, Response, Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import transporter from '../utils/transporter';

const router: Router = express.Router();

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
}

// POST /send-email
router.post('/send-email', async (req: Request<{}, {}, EmailRequest>, res: Response) => {
  const { to, subject, content } = req.body;

  if (!to || !subject || !content) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const templatePath = path.join(__dirname, '..', '..', 'templates', 'general.html');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    const htmlContent = template({ to, subject, content });

    await transporter.sendMail({
      to,
      from: 'justpaay@gmail.com',
      subject,
      html: htmlContent
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Failed to send email', error: (err as Error).message });
  }
});

export default router; 