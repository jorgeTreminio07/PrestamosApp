import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
// Importamos el componente de navegación principal
import AppNavigator from "./src/App/navigation/AppNavigator";
import { initDB } from "./src/data/database/database";
// Importamos el componente de Login
import LoginScreen from "./src/presentation/screens/LoginScreen";

enum APP_STATUS {
  LOADING = "loading", // Inicializando DB
  READY = "ready", // DB conectada, listo para login
  FAILED = "failed", // Error de DB
}

export default function App() {
  const [appStatus, setAppStatus] = useState<APP_STATUS>(APP_STATUS.LOADING);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Estado de autenticación
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

  useEffect(() => {
    const setupDatabase = async (): Promise<void> => {
      try {
        console.log("Iniciando configuración de la base de datos...");
        await initDB();
        console.log("Base de datos lista.");
        setAppStatus(APP_STATUS.READY);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 2000);
      } catch (e) {
        const error = e as Error;
        console.error(
          "Error FATAL al inicializar la base de datos:",
          error.message
        );
        setAppStatus(APP_STATUS.FAILED);
      }
    };

    setupDatabase();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    console.log("Sesión cerrada. Mostrando pantalla de Login.");
  };

  // --- Renderizado Condicional ---

  // 1. Cargando DB
  if (appStatus === APP_STATUS.LOADING) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Configurando Base de Datos...</Text>
      </View>
    );
  }

  // 2. Error en DB
  if (appStatus === APP_STATUS.FAILED) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>¡NO SE CONECTÓ LA BASE DE DATOS!</Text>
        <Text style={styles.errorText}>
          Revisa la consola para más detalles del error.
        </Text>
      </View>
    );
  }

  // 3. DB Conectada (READY): Decide qué mostrar
  if (appStatus === APP_STATUS.READY) {
    // RENDERIZA LOGIN si NO está autenticado
    if (!isAuthenticated) {
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    // RENDERIZA APP NAVIGATOR si SÍ está autenticado
    return (
      <View style={{ flex: 1 }}>
        {/* Pasamos la función de logout al AppNavigator */}
        <AppNavigator onLogout={handleLogout} />
        {showSuccessMessage && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>Base de datos conectada</Text>
          </View>
        )}
      </View>
    );
  }

  return <AppNavigator onLogout={handleLogout} />;
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
