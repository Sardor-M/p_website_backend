import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  try {
    const dataSource = app.get(DataSource);
    if (dataSource.isInitialized) {
      console.log('DB connected now/');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
