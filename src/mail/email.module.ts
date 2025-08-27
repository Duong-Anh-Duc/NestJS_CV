import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { JobsModule } from 'src/jobs/jobs.module';
import { CronManagementService } from './cron-management.service';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { Subscriber, SubscriberSchema } from './schemas/subscriber.schema';

@Module({
  imports : [
    MailerModule.forRootAsync({
      useFactory : async (configService : ConfigService) => ({
        transport : {
          host : configService.get<string>('MAIL_HOST'),
          secure : false,
          auth : {
            user : configService.get<string>('SENDER_EMAIL'),
            pass : configService.get<string>('PASSWORD_EMAIL')
          }
        },
        template : {
          dir : join(__dirname, 'templates'),
          adapter : new HandlebarsAdapter(),
          options : {
            strict : true,
          }
        },
        preview : true
      }),
      inject : [ConfigService]
    }),
    MongooseModule.forFeature([{
      name: Subscriber.name,
      schema: SubscriberSchema
    }]),
    JobsModule
  ],
  controllers: [EmailController],
  providers: [EmailService, CronManagementService],
  exports: [EmailService, CronManagementService]
})
export class EmailModule {}
