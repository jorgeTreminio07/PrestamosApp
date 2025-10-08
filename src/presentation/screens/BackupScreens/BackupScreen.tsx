// BackupScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

const BackupScreen = () => {
  const [loading, setLoading] = useState(false);

  const getDateTimeString = () => {
    const now = new Date();
    const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
    return `${date}_${time}`;
  };

  const handleExport = async () => {
    try {
      setLoading(true);

      const dbFileUri = `${FileSystem.documentDirectory}SQLite/prestamos.db`;
      const backupFileName = `prestamos_backup_${getDateTimeString()}.db`;
      const backupFileUri = `${FileSystem.documentDirectory}${backupFileName}`;

      // Copiamos la base de datos al backup
      await FileSystem.copyAsync({
        from: dbFileUri,
        to: backupFileUri,
      });

      // Compartir o guardar
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(backupFileUri, {
          mimeType: "application/x-sqlite3",
          dialogTitle: "Guardar backup de la base de datos",
        });
      } else {
        Alert.alert(
          "Backup completado",
          `Archivo guardado en:\n${backupFileUri}`
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo hacer el backup de la base de datos");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/*", "application/octet-stream"], // <- permite archivos genéricos
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedFileUri = result.assets[0].uri;
        const dbFileUri = `${FileSystem.documentDirectory}SQLite/prestamos.db`;

        // Sobrescribir la base de datos actual
        await FileSystem.copyAsync({
          from: selectedFileUri,
          to: dbFileUri,
        });

        Alert.alert(
          "Importación exitosa",
          "La base de datos se ha actualizado correctamente"
        );
      } else {
        Alert.alert("Cancelado", "No se seleccionó ningún archivo");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo importar la base de datos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backup de Base de Datos</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleExport}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Exportar DB</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { marginTop: 20, backgroundColor: "#4CAF50" }]}
        onPress={handleImport}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Importar DB</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default BackupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
