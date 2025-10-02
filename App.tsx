import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import AppNavigator from "./src/App/navigation/AppNavigator";
import { initDB } from "./src/data/database/database";

enum DB_STATUS {
  LOADING = "loading",
  CONNECTED = "connected",
  FAILED = "failed",
}

export default function App() {
  const [dbStatus, setDbStatus] = useState<DB_STATUS>(DB_STATUS.LOADING);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

  useEffect(() => {
    const setupDatabase = async (): Promise<void> => {
      try {
        console.log("Iniciando configuración de la base de datos...");
        await initDB();
        console.log("Base de datos lista.");
        setDbStatus(DB_STATUS.CONNECTED);
        setShowSuccessMessage(true);

        // Ocultar el mensaje después de 2 segundos
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 2000);
      } catch (e) {
        const error = e as Error;
        console.error(
          "Error FATAL al inicializar la base de datos:",
          error.message
        );
        setDbStatus(DB_STATUS.FAILED);
      }
    };

    setupDatabase();
  }, []);

  if (dbStatus === DB_STATUS.LOADING) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Configurando Base de Datos...</Text>
      </View>
    );
  }

  if (dbStatus === DB_STATUS.FAILED) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          ⚠️ ¡NO SE CONECTÓ LA BASE DE DATOS!
        </Text>
        <Text style={styles.errorText}>
          Revisa la consola para más detalles del error.
        </Text>
      </View>
    );
  }

  if (dbStatus === DB_STATUS.CONNECTED) {
    return (
      <View style={{ flex: 1 }}>
        <AppNavigator />
        {showSuccessMessage && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>✅ Base de datos conectada</Text>
          </View>
        )}
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffebee",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#c0392b",
    marginBottom: 10,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#2c3e50",
    textAlign: "center",
  },
  successMessage: {
    position: "absolute",
    top: 50,
    left: "10%",
    right: "10%",
    zIndex: 10,
    backgroundColor: "#d4edda",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c3e6cb",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  successText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#155724",
  },
});
