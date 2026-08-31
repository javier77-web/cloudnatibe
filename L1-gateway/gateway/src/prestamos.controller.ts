import { Controller, Get, Headers } from '@nestjs/common';
import { revisarToken } from './token';

@Controller('v1/prestamos')
export class PrestamosController {
  @Get()
  async listar(@Headers('authorization') authorization?: string) {
    const carga = revisarToken(authorization);

    const respuesta = await fetch('http://localhost:3002/prestamos');
    const prestamos = await respuesta.json();

    console.log('Préstamos solicitados por:', carga.name);

    return prestamos;
  }
}
