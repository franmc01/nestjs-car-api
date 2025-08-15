import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import cookieSession = require('cookie-session');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.use((req, res, next) => {
  //   console.log(`📥 ${req.method} ${req.url}`);
  //   console.log('📦 Headers:', req.headers);
  //   next();
  // });

  app.use(
    cookieSession({
      keys: ['my-secret-key'],
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(3000);
}
bootstrap();
