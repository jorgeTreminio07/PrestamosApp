export default class Cliente {
  id: string;
  nombre: string;
  cedula: string;
  direccion: string;
  numeroTelefono: string;

  constructor(
    id: string,
    nombre: string,
    cedula: string,
    direccion: string,
    numeroTelefono: string
  ) {
    this.id = id;
    this.nombre = nombre;
    this.cedula = cedula;
    this.direccion = direccion;
    this.numeroTelefono = numeroTelefono;
  }
}
