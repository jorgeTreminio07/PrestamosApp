// ./src/data/database/database.ts

import * as SQLite from 'expo-sqlite';

// Definimos el tipo de la base de datos para tipar la promesa
type SQLiteDatabase = SQLite.SQLiteDatabase;

// Declaramos 'dbPromise' como una Promesa que resolverá a SQLiteDatabase o null
let dbPromise: Promise<SQLiteDatabase> | null = null;

// Hacemos que initDB sea async y devolvemos void (no devuelve nada)
export const initDB = async (): Promise<void> => {
    // Si la promesa de la DB no se ha inicializado, la creamos
    if (!dbPromise) {
        // La Promesa se tipa automáticamente por openDatabaseAsync
        dbPromise = SQLite.openDatabaseAsync('prestamos.db');
    }
    
    // Esperamos a que la conexión se complete
    const db = await dbPromise;

    // Ejecutamos el comando de creación de tabla clientes.
    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS clientes (
            id TEXT PRIMARY KEY NOT NULL,
            nombre TEXT NOT NULL,
            cedula TEXT NOT NULL,
            direccion TEXT NOT NULL,
            numeroTelefono TEXT NOT NULL
        );`
    );
    

    //  Ejecutamos el comando de creación de la tabla USUARIOS
    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS usuarios (
            id TEXT PRIMARY KEY NOT NULL,
            nombre TEXT NOT NULL,
            correo TEXT UNIQUE NOT NULL, 
            password TEXT NOT NULL
        );`
    );

    // Ejecutamos el comando de creación de la tabla PRÉSTAMOS
    await db.execAsync(
        `
        CREATE TABLE IF NOT EXISTS prestamos (
            id TEXT PRIMARY KEY NOT NULL,
            clienteId TEXT NOT NULL,
            clienteNombre TEXT NOT NULL,
            cantidad REAL NOT NULL,
            interes REAL NOT NULL,
            datePrestamo TEXT NOT NULL,
            periodo INTEGER NOT NULL,
            moneda TEXT NOT NULL,
            tiempo TEXT NOT NULL,
            totalPagar REAL NOT NULL,
            deudaStatus INTEGER NOT NULL, -- 0 (false) o 1 (true)
            fechaVencimiento TEXT NOT NULL,
            montoPagado REAL NOT NULL,
            demoraDias INTEGER NOT NULL,
            FOREIGN KEY (clienteId) REFERENCES clientes(id)
        );
        `
    );

    // EJECUTAMOS EL COMANDO DE CREACIÓN DE LA TABLA ABONOS
    await db.execAsync(
        `
        CREATE TABLE IF NOT EXISTS abonos (
            id TEXT PRIMARY KEY NOT NULL,
            prestamoId TEXT NOT NULL,         -- Clave foránea que referencia al préstamo
            cantidadAbono REAL NOT NULL,      -- Monto del abono
            dateAbono TEXT NOT NULL,          -- Fecha del abono
            FOREIGN KEY (prestamoId) REFERENCES prestamos(id)
        );
        `
    );

};

// Función para obtener la instancia de la DB ya conectada
export const getDB = async (): Promise<SQLiteDatabase> => {
    if (!dbPromise) {
        // Lanzamos un error si intentan usarla antes de inicializar
        throw new Error("La base de datos no ha sido inicializada. Llama a initDB() primero.");
    }
    return await dbPromise;
}