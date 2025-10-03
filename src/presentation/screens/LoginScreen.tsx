import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import UsuarioRepository from "../../data/repositories/UsuarioRepository";

interface Props {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: Props) {
  // Credenciales de prueba (para facilitar el testeo inicial)
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!correo.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor, ingresa correo y contraseña.");
      return;
    }

    setLoading(true);

    try {
      // 1. Buscar usuario por correo usando el repositorio corregido
      const user = await UsuarioRepository.getByCorreo(correo);

      // 2. Validar credenciales
      if (user && user.password === password) {
        // En una app real, aquí se usaría un hash para la contraseña.

        // Simular un pequeño retardo antes del login
        await new Promise((resolve) => setTimeout(resolve, 500));

        onLoginSuccess(); // 3. Si es válido, navega a la aplicación principal
      } else {
        Alert.alert(
          "Error de Acceso",
          "Credenciales incorrectas o usuario no encontrado."
        );
      }
    } catch (error) {
      console.error("Error al intentar iniciar sesión:", error);
      Alert.alert("Error", "Ocurrió un error de conexión al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.title}>Sistema de Gestión de Prestamos</Text>
      <Text style={loginStyles.subtitle}>Inicia Sesión para Continuar</Text>

      <View style={loginStyles.card}>
        <TextInput
          placeholder="Correo electrónico"
          value={correo}
          onChangeText={setCorreo}
          style={loginStyles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        <TextInput
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          style={loginStyles.input}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[loginStyles.button, loading && loginStyles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={loginStyles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#007AFF", // Azul primario
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#E0E0E0",
    marginBottom: 40,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  input: {
    height: 50,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  button: {
    backgroundColor: "#2ecc71", // Verde de éxito
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  footerText: {
    marginTop: 20,
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.7,
  },
});
