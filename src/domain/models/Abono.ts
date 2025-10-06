export default interface Abono {
    id: string; // ID único del abono
    prestamoId: string; // Clave foránea al ID del préstamo
    cantidadAbono: number; // Cantidad abonada
    dateAbono: string; // Fecha en que se realizó el abono (formato YYYY-MM-DD)
}