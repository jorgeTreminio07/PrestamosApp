import { getDB } from '../database/database';
import Abono from '../../domain/models/Abono';
import uuid from 'react-native-uuid';
import PrestamoRepository from './PrestamoRepository';

export default class AbonoRepository {

    /**
     * Registra un nuevo abono para un préstamo específico.
     * @param abono Objeto Abono con prestamoId, cantidadAbono y dateAbono.
     */
    
    static async getById(id: string): Promise<Abono | null> {
        const db = await getDB();
        const abono = await db.getFirstAsync<Abono>('SELECT * FROM abonos WHERE id = ?', [id]);
        return abono ?? null;
    }
    
    static async create(abono: Omit<Abono, 'id'>): Promise<void> {
        const db = await getDB();
        const id = uuid.v4().toString();
        
        console.log(`Registrando abono para préstamo ${abono.prestamoId}: ${abono.cantidadAbono}`);

        await db.runAsync(
            `INSERT INTO abonos (
                id, prestamoId, cantidadAbono, dateAbono
            ) VALUES (?, ?, ?, ?)`,
            [
                id,
                abono.prestamoId,
                abono.cantidadAbono,
                abono.dateAbono,
            ]
        );
        console.log("Abono registrado exitosamente.");
    }

    /**
     * Obtiene todos los abonos realizados para un préstamo específico, ordenados por fecha.
     * @param prestamoId El ID del préstamo cuyos abonos se desean obtener.
     */
    static async getByPrestamoId(prestamoId: string): Promise<Abono[]> {
        const db = await getDB();
        
        const abonos = await db.getAllAsync<Abono>(
            'SELECT * FROM abonos WHERE prestamoId = ? ORDER BY dateAbono DESC',
            [prestamoId]
        );
        
        console.log(`Abonos cargados para el préstamo ${prestamoId}:`, abonos);
        return abonos;
    }

    /**
     * Actualiza un abono existente.
     * Solo permite actualizar la cantidad abonada y la fecha del abono.
     * @param abono Objeto Abono con los datos actualizados.
     */
    /**
     * Actualiza un abono existente y ajusta el balance del préstamo asociado.
     * @param abono Objeto Abono con los datos actualizados (id, cantidadAbono, dateAbono).
     */
    static async update(abono: Abono): Promise<void> {
        const db = await getDB();
        
        // 1. OBTENER el monto original antes de la actualización
        const originalAbono = await AbonoRepository.getById(abono.id);

        if (!originalAbono) {
            throw new Error(`Abono con ID ${abono.id} no encontrado para actualizar.`);
        }
        
        const oldAmount = originalAbono.cantidadAbono;
        const newAmount = abono.cantidadAbono;
        
        // Calcular la diferencia: si es positiva, se suma al montoPagado; si es negativa, se resta.
        const amountDifference = newAmount - oldAmount;

        console.log(`Actualizando abono ID ${abono.id}. Original: ${oldAmount}, Nuevo: ${newAmount}, Diferencia: ${amountDifference}`);

        // 2. ACTUALIZAR el registro del abono en la tabla 'abonos'
        await db.runAsync(
            `UPDATE abonos SET cantidadAbono = ?, dateAbono = ? WHERE id = ?`,
            [
                newAmount, 
                abono.dateAbono,
                abono.id,
            ]
        );

        // 3. AJUSTAR el balance del préstamo (solo si hubo un cambio de monto)
        if (amountDifference !== 0) {
            // Llamamos a la función de PrestamoRepository para centralizar la lógica financiera
            await PrestamoRepository._updatePrestamoBalance(originalAbono.prestamoId, amountDifference);
        }

        console.log("Abono y balance del préstamo actualizados exitosamente.");
    }

    /**
     * Elimina un abono por su ID y ajusta el balance del préstamo asociado (revierte el pago).
     * @param id El ID del abono a eliminar.
     */
    static async delete(id: string): Promise<void> {
        const db = await getDB();
        
        // 1. OBTENER el abono original antes de eliminar para saber cuánto restar del balance
        const originalAbono = await AbonoRepository.getById(id);

        if (!originalAbono) {
            throw new Error(`Abono con ID ${id} no encontrado para eliminar.`);
        }

        // La diferencia es el negativo de la cantidad abonada, pues se "deshace" el pago
        const amountDifference = -originalAbono.cantidadAbono;

        console.log(`Eliminando abono ID ${id}. Cantidad a revertir: ${originalAbono.cantidadAbono}`);

        // 2. ELIMINAR el registro del abono
        await db.runAsync(
            `DELETE FROM abonos WHERE id = ?`,
            [id]
        );

        // 3. AJUSTAR el balance del préstamo
        await PrestamoRepository._updatePrestamoBalance(originalAbono.prestamoId, amountDifference);

        console.log("Abono eliminado y balance del préstamo ajustados exitosamente.");
    }
}
