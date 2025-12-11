import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './app/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });
  app.setGlobalPrefix('v1');

  const config = new DocumentBuilder()
    .setTitle('Schedule API Gateway')
    .setDescription('Документація REST API для розкладу')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.SERVER_PORT || 4000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on path: ${port}/v1`);
  Logger.log(`📑 Swagger documentation is available at: http://localhost:${port}/api/docs`);
}

bootstrap();
