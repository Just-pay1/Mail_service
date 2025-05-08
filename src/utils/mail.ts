import express, { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import transporter from './transporter';

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
}

async function sendEmail(req: EmailRequest): Promise<{ message: string, error?: string }> {
  const { to, subject, content } = req;

  if (!to || !subject || !content) {
    return { message: 'Missing required fields' };
  }

  try {
    const templatePath = path.join(__dirname, '..', '..', 'templates', 'email.html');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    const htmlContent = template({ to, subject, content });

    await transporter.sendMail({
      to,
      from: 'justpaay@gmail.com',
      subject,
      html: htmlContent
    });

    return { message: 'Email sent successfully' };
  } catch (err) {
    console.error('Error:', err);
    return { message: 'Failed to send email', error: (err as Error).message };
  }
}

export default sendEmail;