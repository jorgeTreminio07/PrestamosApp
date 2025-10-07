export default class Configuracion {
  id?: number; // Opcional porque se autoincrementa
  nombreEmpresa: string;
  nombreResponsable: string;
  direccion: string;
  telefono: string;
  frase?: string;

  constructor(
    nombreEmpresa: string,
    nombreResponsable: string,
    direccion: string,
    telefono: string,
    frase?: string,
    id?: number
  ) {
    this.id = id;
    this.nombreEmpresa = nombreEmpresa;
    this.nombreResponsable = nombreResponsable;
    this.direccion = direccion;
    this.telefono = telefono;
    this.frase = frase;
  }
}