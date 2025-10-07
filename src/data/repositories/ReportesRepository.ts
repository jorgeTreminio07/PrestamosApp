import { getDB } from "../database/database";

// 🔹 Función: Reporte de Abonos por rango de fechas
export const getAbonosPorRangoFechas = async (fechaInicio: string, fechaFinal: string) => {
  const db = await getDB();
  const query = `
    SELECT 
      a.dateAbono AS fecha,
      p.clienteNombre AS cliente,
      p.cantidad AS cantidadPrestada,
      a.cantidadAbono AS cantidadAbono
    FROM abonos a
    INNER JOIN prestamos p ON a.prestamoId = p.id
    WHERE DATE(a.dateAbono) BETWEEN DATE(?) AND DATE(?)
    ORDER BY a.dateAbono ASC;
  `;
  const results = await db.getAllAsync(query, [fechaInicio, fechaFinal]);
  return results;
};

// 🔹 Función: Reporte de Préstamos por rango de fechas
export const getPrestamosPorRangoFechas = async (fechaInicio: string, fechaFinal: string) => {
  const db = await getDB();
  const query = `
    SELECT 
      p.datePrestamo AS fecha,
      p.clienteNombre AS cliente,
      p.cantidad AS cantidadPrestada
    FROM prestamos p
    WHERE DATE(p.datePrestamo) BETWEEN DATE(?) AND DATE(?)
    ORDER BY p.datePrestamo ASC;
  `;
  const results = await db.getAllAsync(query, [fechaInicio, fechaFinal]);
  return results;
};

// 🔹 Función: Arqueo de Caja por día
export const getArqueoCajaPorDia = async (fecha: string) => {
  const db = await getDB();
  const query = `
    SELECT 
      a.dateAbono AS fecha,
      p.clienteNombre AS cliente,
      a.cantidadAbono AS abono
    FROM abonos a
    INNER JOIN prestamos p ON a.prestamoId = p.id
    WHERE DATE(a.dateAbono) = DATE(?)
    ORDER BY a.dateAbono ASC;
  `;
  const results = await db.getAllAsync(query, [fecha]);
  return results;
};

// 🔹 Función: Clientes Atrasados (basado en la fecha actual local de Nicaragua)
export const getClientesAtrasados = async () => {
  const db = await getDB();

  // Tomamos la fecha actual del sistema (sin afectar el UTC)
  const fechaActual = new Date();
  const año = fechaActual.getFullYear();
  const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaActual.getDate()).padStart(2, "0");
  const fechaLocal = `${año}-${mes}-${dia}`;

  const query = `
    SELECT 
      p.datePrestamo AS fechaPrestamo,
      p.fechaVencimiento AS fechaVencimiento,
      p.clienteNombre AS cliente,
      p.cantidad AS cantidadPrestada,
      p.totalPagar AS totalPagar
    FROM prestamos p
    WHERE DATE(p.fechaVencimiento) < DATE(?)
    ORDER BY p.fechaVencimiento ASC;
  `;

  const results = await db.getAllAsync(query, [fechaLocal]);
  return results;
};
