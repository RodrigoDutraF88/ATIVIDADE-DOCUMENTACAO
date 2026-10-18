import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Sessão 4: em produção a documentação não sobe (/api e /api-json dão 404).
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Agenda de SEU NOME')
      .setDescription('API de eventos da Agenda, atividade da Trilha de Documentação de API da CJR.')
      .setVersion('1.0.0')
      .setContact('Capacitação CJR', 'https://github.com/RodrigoDutraF88/TRILHA-DOCUMENTACAO', 'capacitacao@exemplo.com')
      .addServer('http://localhost:3000', 'Local')
      .addTag('eventos', 'Criar, listar, editar e remover eventos da agenda')
      .addTag('admin', 'Rotas restritas, exigem o token bearer de admin')
      .addBearerAuth()
      .build();
    const documento = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documento);
  }

  const porta = Number(process.env.PORT ?? 3000);
  await app.listen(porta);
  console.log(`Agenda no ar em http://localhost:${porta}`);
}

bootstrap();
