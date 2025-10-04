// domain/models/Prestamo.ts

/**
 * Define la estructura de un Préstamo en la aplicación.
 *
 * Incluye campos de entrada (cantidad, interés, fecha) y campos calculados
 * (totalPagar, estado de deuda, y fecha de vencimiento).
 */
export type Tiempo = "Días" | "Semanas" | "Meses";
export type Moneda = "$" | "C$";

export default interface Prestamo {
  id: string;
  clienteId: string;
  clienteNombre: string; // Campo extra para mostrar el nombre sin consultar la tabla Cliente
  
  // Datos de entrada del formulario
  cantidad: number; // Cantidad prestada (principal)
  moneda: Moneda;
  interes: number; // Tasa de interés (%)
  datePrestamo: string; // Fecha en que se otorgó el préstamo (YYYY-MM-DD)
  periodo: number; // Duración del plazo (ej: 3, 5, 12)
  tiempo: Tiempo; // Unidad de tiempo ("Días", "Semanas", "Meses")

  // Campos calculados y de estado
  totalPagar: number; // Principal + Intereses + Demoras (cambia con pagos/atrasos)
  deudaStatus: boolean; // TRUE si totalPagar > 0.
  fechaVencimiento: string; // Fecha límite para el pago inicial (Calculada)

  // Campos de gestión (para la lógica de pagos/atrasos)
  montoPagado: number; // Suma de los abonos realizados
  demoraDias: number; // Días que lleva de retraso respecto a fechaVencimiento
}
