
export default interface Usuario {
    id: string; // GUID
    nombre: string;
    correo: string;
    password: string; // hash
}