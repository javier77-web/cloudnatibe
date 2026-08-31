import { Module } from '@nestjs/common';
import { LibrosController } from './libros.controller';
import { PrestamosController } from './prestamos.controller';

@Module({ controllers: [LibrosController, PrestamosController] })
export class AppModule {}