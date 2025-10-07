// src/data/repositories/ConfiguracionRepository.ts

import { getDB } from "../database/database";
import Configuracion from "../../domain/models/Configuracion";

export default class ConfiguracionRepository {

  static async get(): Promise<Configuracion | undefined> {
  const db = await getDB();
  const config = await db.getFirstAsync<Configuracion>(
    "SELECT * FROM configuracion WHERE id = 1"
  );
  return config ?? undefined;
}


  // ACTUALIZAR LA CONFIGURACIÓN
  static async update(config: Configuracion): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE configuracion
     SET nombreEmpresa = ?,
         nombreResponsable = ?,
         direccion = ?,
         telefono = ?,
         frase = ?
     WHERE id = 1`,
    [
      config.nombreEmpresa,
      config.nombreResponsable,
      config.direccion,
      config.telefono,
      config.frase ?? "",
    ]
  );
}


  // OPCIONAL: crear la configuración por defecto si no existe el id = 1
static async createIfNotExists(): Promise<void> {
  const db = await getDB();

  // Verificamos si ya existe un registro con id = 1
  const existing = await db.getFirstAsync<Configuracion>(
    `SELECT * FROM configuracion WHERE id = 1`
  );

  if (!existing) {
    // Creamos un registro por defecto
    const defaultConfig: Configuracion = {
      id: 1,
      nombreEmpresa: "Mi Empresa",
      nombreResponsable: "Responsable",
      direccion: "Dirección por defecto",
      telefono: "12345678",
      frase: "Frase por defecto",
    };

    await db.runAsync(
      `INSERT INTO configuracion (id, nombreEmpresa, nombreResponsable, direccion, telefono, frase)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        1,
        defaultConfig.nombreEmpresa,
        defaultConfig.nombreResponsable,
        defaultConfig.direccion,
        defaultConfig.telefono,
        defaultConfig.frase ?? "",
      ]
    );
  }
}
}
