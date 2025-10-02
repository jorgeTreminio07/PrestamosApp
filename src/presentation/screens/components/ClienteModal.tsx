import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet, Text, Modal } from "react-native";
import Cliente from "../../../domain/models/Cliente";
import uuid from "react-native-uuid";

// Definimos los tipos para el estado de error
interface ErrorState {
  nombre: boolean;
  cedula: boolean;
  direccion: boolean;
  numeroTelefono: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (cliente: Cliente) => void;
  clienteToEdit?: Cliente;
}

const initialErrors: ErrorState = {
  nombre: false,
  cedula: false,
  direccion: false,
  numeroTelefono: false,
};

export default function ClienteModal({
  visible,
  onClose,
  onSave,
  clienteToEdit,
}: Props) {
  // 💡 ESTADOS DE DATOS
  const [nombre, setNombre] = useState(clienteToEdit?.nombre || "");
  const [cedula, setCedula] = useState(clienteToEdit?.cedula || "");
  const [direccion, setDireccion] = useState(clienteToEdit?.direccion || "");
  const [numeroTelefono, setNumeroTelefono] = useState(
    clienteToEdit?.numeroTelefono || ""
  );

  // 💡 ESTADO DE ERRORES: Inicialmente todos falsos
  const [errors, setErrors] = useState<ErrorState>(initialErrors);

  // 💡 EFECTO para resetear los campos y errores cuando el modal se abre/cierra o clienteToEdit cambia
  useEffect(() => {
    if (visible) {
      setNombre(clienteToEdit?.nombre || "");
      setCedula(clienteToEdit?.cedula || "");
      setDireccion(clienteToEdit?.direccion || "");
      setNumeroTelefono(clienteToEdit?.numeroTelefono || "");
      setErrors(initialErrors); // Resetear errores al abrir
    }
  }, [visible, clienteToEdit]);

  // Función de validación y guardado
  const handleSave = () => {
    let hasError = false;
    const newErrors: ErrorState = { ...initialErrors };

    // 1. VALIDACIÓN DE CADA CAMPO
    if (!nombre.trim()) {
      newErrors.nombre = true;
      hasError = true;
    }
    if (!cedula.trim()) {
      newErrors.cedula = true;
      hasError = true;
    }
    if (!direccion.trim()) {
      newErrors.direccion = true;
      hasError = true;
    }
    if (!numeroTelefono.trim()) {
      newErrors.numeroTelefono = true;
      hasError = true;
    }

    // 2. ACTUALIZAR ESTADO DE ERRORES
    setErrors(newErrors);

    // 3. SI HAY ERRORES, DETENER EL PROCESO
    if (hasError) {
      return; // ⬅️ Ya no usamos alert()
    }

    // 4. SI LA VALIDACIÓN ES EXITOSA, CONTINUAR CON EL GUARDADO
    const cliente: Cliente = clienteToEdit
      ? { ...clienteToEdit, nombre, cedula, direccion, numeroTelefono }
      : {
          id: uuid.v4().toString(), // Asumiendo que Cliente es una interfaz/tipo y puede crearse así
          nombre,
          cedula,
          direccion,
          numeroTelefono,
        };

    onSave(cliente);
    // Los estados se resetean en el useEffect cuando el modal se cierra
  };

  // Función helper para obtener el estilo del input
  const getInputStyle = (fieldName: keyof ErrorState) => [
    styles.input,
    errors[fieldName] && styles.inputError,
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {clienteToEdit ? "Editar Cliente" : "Crear Cliente"}
          </Text>

          {/* Nombre */}
          <TextInput
            placeholder="Nombre"
            value={nombre}
            onChangeText={(text) => {
              setNombre(text);
              setErrors({ ...errors, nombre: false });
            }}
            style={getInputStyle("nombre")}
          />
          {errors.nombre && (
            <Text style={styles.errorText}>Nombre es obligatorio</Text>
          )}

          {/* Cédula */}
          <TextInput
            placeholder="Cédula"
            value={cedula}
            onChangeText={(text) => {
              setCedula(text);
              setErrors({ ...errors, cedula: false });
            }}
            style={getInputStyle("cedula")}
          />
          {errors.cedula && (
            <Text style={styles.errorText}>Cédula es obligatoria</Text>
          )}

          {/* Dirección */}
          <TextInput
            placeholder="Dirección"
            value={direccion}
            onChangeText={(text) => {
              setDireccion(text);
              setErrors({ ...errors, direccion: false });
            }}
            style={getInputStyle("direccion")}
          />
          {errors.direccion && (
            <Text style={styles.errorText}>Dirección es obligatoria</Text>
          )}

          {/* Teléfono */}
          <TextInput
            placeholder="Teléfono"
            value={numeroTelefono}
            onChangeText={(text) => {
              setNumeroTelefono(text);
              setErrors({ ...errors, numeroTelefono: false });
            }}
            style={getInputStyle("numeroTelefono")}
            keyboardType="phone-pad"
          />
          {errors.numeroTelefono && (
            <Text style={styles.errorText}>Teléfono es obligatorio</Text>
          )}

          <View style={styles.buttons}>
            <Button title="Cancelar" onPress={onClose} color="#888" />
            <Button title="Guardar" onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10, // Menor margen aquí para que el errorText quepa
    padding: 8,
  },
  // 💡 NUEVO ESTILO: Borde rojo para el error
  inputError: {
    borderColor: "red",
    borderWidth: 2, // Hacemos el borde un poco más grueso para que se note
  },
  // 💡 NUEVO ESTILO: Texto de error
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    marginTop: -8, // Mueve el texto más cerca del input para que el marginBottom del input anterior no sea tan grande
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});
