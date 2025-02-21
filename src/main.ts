import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // app.useGlobalFilters(new HttpExceptionFilter());
  // app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors();
  try {
    const dataSource = app.get(DataSource);
    if (dataSource.isInitialized) {
      console.log('DB connected now/');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
