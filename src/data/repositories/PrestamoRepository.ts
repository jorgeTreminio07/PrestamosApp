// src/data/repositories/PrestamoRepository.ts

// ⚠️ Importamos getDB para obtener la instancia de la base de datos
import { getDB } from '../database/database';
import Prestamo, { Tiempo } from '../../domain/models/Prestamo'; 
import * as SQLite from 'expo-sqlite'; 
import uuid from 'react-native-uuid';

// NOTA: Utilizamos una clase con métodos estáticos para seguir la convención del ClienteRepository.

export default class PrestamoRepository {

    /**
     * Calcula el monto total inicial (Principal + Interés) y la fecha de vencimiento.
     * @param prestamo Datos de entrada del préstamo (cantidad, interés, periodo, tiempo, fecha).
     */
    private static _calculateFinancials(prestamo: { cantidad: number, interes: number, periodo: number, tiempo: Tiempo, datePrestamo: string }): { totalDeudaInicial: number, fechaVencimiento: string } {
        const { cantidad, interes, periodo, tiempo, datePrestamo } = prestamo;

        // 1. Cálculo del Total Inicial (Principal + Intereses Simples)
        const interesMonto = cantidad * (interes / 100);
        const totalDeudaInicial = cantidad + (periodo * interesMonto);

        // 2. Cálculo de la Fecha de Vencimiento
        const date = new Date(datePrestamo);
        if (tiempo === "Días") {
            date.setDate(date.getDate() + periodo);
        } else if (tiempo === "Semanas") {
            date.setDate(date.getDate() + periodo * 7);
        } else if (tiempo === "Meses") {
            date.setMonth(date.getMonth() + periodo);
        }
        // Formato YYYY-MM-DD
        const fechaVencimiento = date.toISOString().split('T')[0];

        return { totalDeudaInicial: parseFloat(totalDeudaInicial.toFixed(2)), fechaVencimiento };
    }


    // --- 1. OBTENER TODOS ---
    /**
     * Obtiene todos los préstamos, ordenados por fecha de forma descendente.
     */
    static async getAll(): Promise<Prestamo[]> {
        const db = await getDB();
        // Usamos .getAllAsync para obtener una lista tipada.
        const prestamos = await db.getAllAsync<Prestamo>('SELECT * FROM prestamos ORDER BY datePrestamo DESC');
        console.log("Préstamos cargados:", prestamos);
        return prestamos;
    }

    // --- 2. OBTENER POR ID (NECESARIO) ---
    /**
     * Obtiene un préstamo específico por su ID.
     */
    static async getById(id: string): Promise<Prestamo | null> {
        const db = await getDB();
        // Usamos .getFirstAsync para obtener un solo resultado.
        const prestamo = await db.getFirstAsync<Prestamo>('SELECT * FROM prestamos WHERE id = ?', [id]);
        // Si no existe, devuelve null.
        return prestamo ?? null;
    }

    // --- 3. BUSCAR ---
    /**
     * Busca préstamos por nombre o ID del cliente.
     */
    static async search(query: string): Promise<Prestamo[]> {
        const db = await getDB();
        const searchParam = `%${query}%`;
        
        // Buscamos por el nombre del cliente almacenado en el registro de préstamo.
        const prestamos = await db.getAllAsync<Prestamo>(
            'SELECT * FROM prestamos WHERE clienteNombre LIKE ? OR clienteId LIKE ? ORDER BY datePrestamo COLLATE NOCASE ASC',
            [searchParam, searchParam]
        );
        return prestamos;
    }


    // --- 4. CREAR (INSERT) ---
    /**
     * Crea un nuevo préstamo. El repositorio se encarga de calcular los valores iniciales.
     */
    static async create(prestamo: Prestamo): Promise<void> {
        const db = await getDB();
        const id = uuid.v4().toString();

        // Calcular valores iniciales
        const { totalDeudaInicial, fechaVencimiento } = PrestamoRepository._calculateFinancials(prestamo);

        console.log("insertando en la db", prestamo);
        // El 'totalPagar' inicial es igual al 'totalDeudaInicial' (Principal + Intereses),
        // ya que el 'montoPagado' es 0 y no hay 'demoraDias'.
        await db.runAsync(
            `INSERT INTO prestamos (
                id, clienteId, clienteNombre, cantidad, moneda, interes, datePrestamo,
                periodo, tiempo, totalPagar, deudaStatus, fechaVencimiento, montoPagado, demoraDias
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id, prestamo.clienteId, prestamo.clienteNombre, prestamo.cantidad, prestamo.moneda,
              prestamo.interes, prestamo.datePrestamo, prestamo.periodo, prestamo.tiempo,
              totalDeudaInicial, 1, // deudaStatus = 1 (TRUE)
              fechaVencimiento, 0, // montoPagado = 0
              0 // demoraDias = 0
            ]
        );
    }

    // --- 5. ACTUALIZAR (UPDATE) ---
    /**
     * Actualiza los campos principales de un préstamo.
     * Requiere el préstamo completo (incluyendo los valores de estado actuales).
     */
    static async update(prestamo: Prestamo): Promise<void> {
        const db = await getDB();
        
        // Recalculamos los totales si los parámetros de cantidad/interés/plazo cambiaron
        const { totalDeudaInicial, fechaVencimiento } = PrestamoRepository._calculateFinancials(prestamo);
        
        // El nuevo totalPagar es el total inicial menos lo que ya se ha pagado.
        const nuevoTotalPendiente = totalDeudaInicial - prestamo.montoPagado;
        const nuevaDeudaStatus = nuevoTotalPendiente > 0 ? 1 : 0;

        await db.runAsync(
            `UPDATE prestamos SET 
                clienteId=?, clienteNombre=?, cantidad=?, moneda=?, interes=?, datePrestamo=?,
                periodo=?, tiempo=?, totalPagar=?, fechaVencimiento=?, deudaStatus=?
             WHERE id=?`,
            [
              prestamo.clienteId, prestamo.clienteNombre, prestamo.cantidad, prestamo.moneda,
              prestamo.interes, prestamo.datePrestamo, prestamo.periodo, prestamo.tiempo,
              nuevoTotalPendiente, fechaVencimiento, nuevaDeudaStatus,
              prestamo.id
            ]
        );
    }

    // --- 6. ELIMINAR ---
    /**
     * Elimina un préstamo por su ID.
     */
    static async delete(id: string): Promise<void> {
        const db = await getDB();
        await db.runAsync('DELETE FROM prestamos WHERE id = ?', [id]);
    }

    // --- 7. REALIZAR PAGO (LÓGICA CRUCIAL) ---
    /**
     * Registra un pago y actualiza el estado del préstamo (montoPagado, totalPagar, deudaStatus).
     */
    static async makePayment(id: string, amount: number): Promise<void> {
        const db = await getDB();
        
        // 1. Obtener el préstamo actual
        const prestamoActual = await PrestamoRepository.getById(id);
        if (!prestamoActual) {
            throw new Error("Préstamo no encontrado.");
        }

        // 2. Calcular los nuevos valores
        const nuevoMontoPagado = prestamoActual.montoPagado + amount;

        // Recalcular la deuda total inicial con los parámetros actuales del préstamo
        const { totalDeudaInicial } = PrestamoRepository._calculateFinancials(prestamoActual);

        // Nuevo total pendiente = Total Inicial - Nuevo Monto Pagado
        const nuevoTotalPendiente = parseFloat((totalDeudaInicial - nuevoMontoPagado).toFixed(2));
        
        // Aseguramos que el total a pagar no sea negativo
        const totalPagarFinal = Math.max(0, nuevoTotalPendiente);
        const nuevaDeudaStatus = totalPagarFinal > 0 ? 1 : 0; // 1: Activa, 0: Saldada

        // 3. Actualizar la base de datos
        await db.runAsync(
            `UPDATE prestamos SET 
                montoPagado = ?,
                totalPagar = ?,
                deudaStatus = ?
             WHERE id = ?`,
            [
              nuevoMontoPagado,
              totalPagarFinal,
              nuevaDeudaStatus,
              id
            ]
        );
    }
}