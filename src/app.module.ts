import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { Analytics } from './analytics/analytics.entity';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { DatabasesModule } from './databases/databases.module';
import { FilesModule } from './files/files.module';
import { JobsModule } from './jobs/jobs.module';
import { EmailModule } from './mail/email.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ResumesModule } from './resumes/resumes.module';
import { RolesModule } from './roles/roles.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl : 60,
      limit : 1000,
    }),
    MongooseModule.forRootAsync({
      imports : [ConfigModule],
      useFactory : async(configService : ConfigService) => ({
        uri : configService.get<string>('MONGODB_URI'),
        connectionFactory : (connection) => {
          connection.plugin(softDeletePlugin);
          return connection
        }
      }),
      inject : [ConfigService]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USERNAME'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DATABASE'),
        entities: [Analytics], 
        synchronize: false,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot(
      {
        isGlobal : true,
      }
    ),
    UsersModule,
    AuthModule,
    CompaniesModule,
    JobsModule,
    FilesModule,
    ResumesModule,
    PermissionsModule,
    RolesModule,
    DatabasesModule,
    SubscribersModule,
    EmailModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
