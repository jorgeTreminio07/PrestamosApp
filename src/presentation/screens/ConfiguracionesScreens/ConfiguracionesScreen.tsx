import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import ConfiguracionRepository from "../../../data/repositories/ConfiguracionesRepository";
import Configuracion from "../../../domain/models/Configuracion";

type Message = {
  text: string;
  type: "success" | "error";
};

export default function ConfiguracionesScreen() {
  const [config, setConfig] = useState<Configuracion>({
    id: 1,
    nombreEmpresa: "",
    nombreResponsable: "",
    direccion: "",
    telefono: "",
    frase: "",
  });

  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState<Message | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        await ConfiguracionRepository.createIfNotExists();
        const existingConfig = await ConfiguracionRepository.get();
        if (existingConfig) setConfig(existingConfig);
      } catch (error) {
        console.error("Error cargando configuración:", error);
        setMensaje({ text: "❌ Error cargando configuración", type: "error" });
        setTimeout(() => setMensaje(null), 2000);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleChange = (field: keyof Configuracion, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    try {
      await ConfiguracionRepository.update(config);
      setMensaje({
        text: "✅ Configuración actualizada correctamente",
        type: "success",
      });

      const updatedConfig = await ConfiguracionRepository.get();
      if (updatedConfig) setConfig(updatedConfig);
    } catch (error) {
      console.error("Error actualizando configuración:", error);
      setMensaje({
        text: "❌ No se pudo actualizar la configuración",
        type: "error",
      });
    } finally {
      setTimeout(() => setMensaje(null), 2000);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando configuración...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Configuración de la Empresa</Text>

        <Text style={styles.label}>Nombre de la Empresa</Text>
        <TextInput
          style={styles.input}
          value={config.nombreEmpresa}
          onChangeText={(text) => handleChange("nombreEmpresa", text)}
        />

        <Text style={styles.label}>Nombre del Responsable</Text>
        <TextInput
          style={styles.input}
          value={config.nombreResponsable}
          onChangeText={(text) => handleChange("nombreResponsable", text)}
        />

        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          value={config.direccion}
          onChangeText={(text) => handleChange("direccion", text)}
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={config.telefono}
          onChangeText={(text) => handleChange("telefono", text)}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Frase</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={config.frase}
          onChangeText={(text) => handleChange("frase", text)}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Actualizar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MENSAJE FLOTANTE */}
      {mensaje && (
        <View
          style={[
            styles.successMessage,
            mensaje.type === "error" && styles.errorMessage,
          ]}
        >
          <Text style={styles.successText}>{mensaje.text}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
    color: "#555",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  successMessage: {
    position: "absolute",
    top: 10,
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
  errorMessage: {
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
  },
});
