import express, { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import transporter from './transporter';

export interface EmailRequest {
  to: string;
  subject: string;
  content: string;
}

async function sendEmail(req: EmailRequest){
  const { to, subject, content } = req;

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
    console.log(`Email sent to ${to} with subject "${subject}"`);

    return true
  } catch (err) {
    console.log('Error:', err);
    return false
  }
}

export default sendEmail;