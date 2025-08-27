import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from "./app.module";
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filter/http-exception.filter';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService)
  const reflector = app.get(Reflector)
 app.useGlobalGuards(new JwtAuthGuard(reflector))
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setGlobalPrefix('api', {
    exclude: [
      '/images/(.*)',
      '/css/(.*)',
      '/public/(.*)',
      '/favicon.ico',
    ]
  })
  app.enableVersioning({
    type : VersioningType.URI,
    defaultVersion : ['1', '2']
  })
  app.setViewEngine('ejs')
  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist : true
    }
  ))
  app.use(helmet())
  app.use(cookieParser())
  app.useGlobalInterceptors(new TransformInterceptor(reflector))
  app.useGlobalFilters(new AllExceptionsFilter())
  app.enableCors({
    "origin" : true,
    "methods" : "GET, HEAD, PUT, PATCH, POST, DELETE",
    "preflightContinue" : false,
    credentials : true
  });
  await app.listen(process.env.PORT);
}
bootstrap();
