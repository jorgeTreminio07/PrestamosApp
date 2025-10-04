// src/data/repositories/UsuarioRepository.ts

// ⚠️ Importamos getDB para obtener la instancia de la base de datos
import { getDB } from '../database/database'; 
import Usuario from '../../domain/models/Usuario'; // Asegúrate de que la ruta sea correcta
import * as SQLite from 'expo-sqlite'; // Importamos SQLite para tipar la base de datos

// NOTA: Seguimos el patrón de acceder a la DB de forma asíncrona en cada método.

export default class UsuarioRepository {

    // 💡 MÉTODO CORREGIDO
  static async getByCorreo(correo: string): Promise<Usuario | undefined> {
    const db = await getDB();
    
    // .getFirstAsync<Usuario> devuelve Usuario | null
    const usuario = await db.getFirstAsync<Usuario>(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );

    // 💡 CORRECCIÓN: Si el resultado es null, devolvemos undefined para coincidir con la promesa.
    // Si es Usuario, se devuelve tal cual.
    return usuario ?? undefined; 
  }
 
  // 1. OBTENER TODOS
  static async getAll(): Promise<Usuario[]> {
    // 💡 Obtener la instancia de la base de datos de forma asíncrona
    const db = await getDB(); 
    // Usamos .getAllAsync
    const usuarios = await db.getAllAsync<Usuario>('SELECT * FROM usuarios ORDER BY nombre COLLATE NOCASE ASC');
    return usuarios;
  }
  
  // 2. BUSCAR por nombre o correo (similar al search de Cliente)
  static async search(query: string): Promise<Usuario[]> {
    const db = await getDB();
    const searchParam = `%${query}%`;
    
    // Buscamos por nombre O correo
    const usuarios = await db.getAllAsync<Usuario>(
      'SELECT * FROM usuarios WHERE nombre LIKE ? OR correo LIKE ?',
      [searchParam, searchParam]
    );
    return usuarios;
  }

  // 3. CREAR
  static async create(usuario: Usuario): Promise<void> {
    const db = await getDB();
    // Usamos .runAsync para INSERT
    await db.runAsync(
      'INSERT INTO usuarios (id, nombre, correo, password) VALUES (?, ?, ?, ?)',
      [usuario.id, usuario.nombre, usuario.correo, usuario.password]
    );
  }

  // 4. ACTUALIZAR
  static async update(usuario: Usuario): Promise<void> {
    const db = await getDB();
    // Usamos .runAsync para UPDATE
    await db.runAsync(
      'UPDATE usuarios SET nombre=?, correo=?, password=? WHERE id=?',
      [usuario.nombre, usuario.correo, usuario.password, usuario.id]
    );
  }

  // 5. ELIMINAR
  static async delete(id: string): Promise<void> {
    const db = await getDB();
    // Usamos .runAsync para DELETE
    await db.runAsync('DELETE FROM usuarios WHERE id=?', [id]);
  }
}

