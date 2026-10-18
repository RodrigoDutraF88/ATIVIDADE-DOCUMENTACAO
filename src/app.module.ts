import { Module } from '@nestjs/common';
import { AdminController } from './admin/admin.controller';
import { EventosController } from './eventos/eventos.controller';
import { EventosService } from './eventos/eventos.service';

@Module({
  controllers: [EventosController, AdminController],
  providers: [EventosService],
})
export class AppModule {}
