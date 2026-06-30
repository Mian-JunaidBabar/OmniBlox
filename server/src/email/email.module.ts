import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { EmailService } from './email.service';

const resendApiKey = process.env.RESEND_API_KEY;

const transport = resendApiKey
  ? {
      host: process.env.MAIL_HOST || 'smtp.resend.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER || 'resend',
        pass: resendApiKey,
      },
    }
  : {
      host: process.env.MAIL_HOST || 'localhost',
      port: parseInt(process.env.MAIL_PORT || '1025'),
      ignoreTLS: true,
      secure: false,
    };

@Module({
  imports: [
    MailerModule.forRoot({
      transport,
      defaults: {
        from: `"${process.env.MAIL_FROM_NAME || 'OmniBlox'}" <${
          process.env.MAIL_FROM || 'noreply@omniblox.com'
        }>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
