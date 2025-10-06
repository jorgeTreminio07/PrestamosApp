import { getDB } from '../database/database';
import Abono from '../../domain/models/Abono';
import uuid from 'react-native-uuid';

export default class AbonoRepository {

    /**
     * Registra un nuevo abono para un préstamo específico.
     * @param abono Objeto Abono con prestamoId, cantidadAbono y dateAbono.
     */
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
    static async update(abono: Abono): Promise<void> {
        const db = await getDB();
        
        console.log(`Actualizando abono ID ${abono.id} con nueva cantidad: ${abono.cantidadAbono}`);

        await db.runAsync(
            `UPDATE abonos SET cantidadAbono = ?, dateAbono = ? WHERE id = ?`,
            [
                abono.cantidadAbono,
                abono.dateAbono,
                abono.id,
            ]
        );
        console.log("Abono actualizado exitosamente.");
    }

    /**
     * Elimina un abono por su ID.
     * @param id El ID del abono a eliminar.
     */
    static async delete(id: string): Promise<void> {
        const db = await getDB();
        
        console.log(`Eliminando abono ID ${id}`);

        await db.runAsync(
            `DELETE FROM abonos WHERE id = ?`,
            [id]
        );
        console.log("Abono eliminado exitosamente.");
    }
}
