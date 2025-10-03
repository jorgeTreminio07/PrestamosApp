
export default interface Usuario {
    id: string; // GUID
    nombre: string;
    correo: string;
    password: string; // En una aplicación real, esto debe ser un hash
}