export default interface Abono {
    id: string; 
    prestamoId: string; // Clave foránea al ID del préstamo
    cantidadAbono: number; 
    dateAbono: string; 
}