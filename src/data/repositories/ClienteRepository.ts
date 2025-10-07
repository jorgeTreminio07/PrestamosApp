// src/data/repositories/ClienteRepository.ts

//  Importamos getDB para obtener la instancia de la base de datos
import { getDB } from '../database/database'; 
import Cliente from '../../domain/models/Cliente'; // Asegúrate de que la ruta sea correcta
import * as SQLite from 'expo-sqlite';

export default class ClienteRepository {


    static async findById(id: string): Promise<Cliente | undefined> {
    console.log(`Buscando cliente por ID: ${id}`);
    const db = await getDB();

    // Usamos getFirstAsync para obtener un solo registro
    const cliente = await db.getFirstAsync<Cliente>(
      'SELECT * FROM clientes WHERE id = ?',
      [id]
    );

    // Si el cliente es null o undefined, devolvemos undefined
    return cliente ?? undefined;
  }
 
 // 1. OBTENER TODOS
    static async getAll(): Promise<Cliente[]> {
        //  Obtener la instancia de la base de datos de forma asíncrona
        const db = await getDB(); 
        // Usamos .getAllAsync
        const clientes = await db.getAllAsync<Cliente>('SELECT * FROM clientes ORDER BY nombre COLLATE NOCASE ASC');
        return clientes;
    }

// 2. BUSCAR
    static async search(query: string): Promise<Cliente[]> {
        const db = await getDB();
        const searchParam = `%${query}%`;
        
        // Usamos .getAllAsync
        const clientes = await db.getAllAsync<Cliente>(
        'SELECT * FROM clientes WHERE nombre LIKE ? OR cedula LIKE ?',
        [searchParam, searchParam]
        );
        return clientes;    
    }

    // 3. CREAR
    static async create(cliente: Cliente): Promise<void> {
        const db = await getDB();
        // Usamos .runAsync
        await db.runAsync(
        'INSERT INTO clientes (id, nombre, cedula, direccion, numeroTelefono) VALUES (?, ?, ?, ?, ?)',
        [cliente.id, cliente.nombre, cliente.cedula, cliente.direccion, cliente.numeroTelefono]
        );
    }

    // 4. ACTUALIZAR
    static async update(cliente: Cliente): Promise<void> {
        const db = await getDB();
        // Usamos .runAsync.
        await db.runAsync(
        'UPDATE clientes SET nombre=?, cedula=?, direccion=?, numeroTelefono=? WHERE id=?',
        [cliente.nombre, cliente.cedula, cliente.direccion, cliente.numeroTelefono, cliente.id]
        );
    }

    // 5. ELIMINAR
    static async delete(id: string): Promise<void> {
        const db = await getDB();
        // Usamos .runAsync.
        await db.runAsync('DELETE FROM clientes WHERE id=?', [id]);
        }
    }