// ./src/screens/UsuariosScreen/components/UserModal.tsx

import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet, Text, Modal } from "react-native";
import Usuario from "../../../../domain/models/Usuario";
import uuid from "react-native-uuid";

// 💡 Definimos los tipos para el estado de error de Usuario
interface ErrorState {
  nombre: boolean;
  correo: boolean;
  password: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (usuario: Usuario) => void;
  usuarioToEdit?: Usuario; // Usamos usuarioToEdit en lugar de clienteToEdit
}

const initialErrors: ErrorState = {
  nombre: false,
  correo: false,
  password: false,
};

export default function UserModal({
  visible,
  onClose,
  onSave,
  usuarioToEdit, // Usamos usuarioToEdit
}: Props) {
  // 💡 ESTADOS DE DATOS
  const [nombre, setNombre] = useState(usuarioToEdit?.nombre || "");
  const [correo, setCorreo] = useState(usuarioToEdit?.correo || "");
  // NOTA: Para edición, la contraseña se deja vacía y solo se pide si se quiere cambiar.
  // Para creación, debe ser obligatoria. Usaremos un valor temporal para edición.
  const [password, setPassword] = useState("");

  // 💡 ESTADO DE ERRORES
  const [errors, setErrors] = useState<ErrorState>(initialErrors);

  // 💡 EFECTO para rellenar campos y resetear errores
  useEffect(() => {
    if (visible) {
      setNombre(usuarioToEdit?.nombre || "");
      setCorreo(usuarioToEdit?.correo || "");
      setPassword(""); // Siempre resetear password en el modal
      setErrors(initialErrors);
    }
  }, [visible, usuarioToEdit]);

  // Función de validación y guardado
  const handleSave = () => {
    let hasError = false;
    const newErrors: ErrorState = { ...initialErrors };

    // 1. VALIDACIÓN
    if (!nombre.trim()) {
      newErrors.nombre = true;
      hasError = true;
    }
    if (!correo.trim()) {
      newErrors.correo = true;
      hasError = true;
    }

    // La contraseña es obligatoria SOLO si estamos CREANDO o si se está INTENTANDO cambiar en la edición
    if (!usuarioToEdit && !password.trim()) {
      newErrors.password = true;
      hasError = true;
    }
    // Si estamos editando y el campo está vacío, no es un error (asume que no se quiere cambiar)
    // Si estamos editando y el campo tiene valor, lo usaremos

    // 2. ACTUALIZAR ESTADO DE ERRORES
    setErrors(newErrors);

    if (hasError) {
      return;
    }

    // 3. CONSTRUIR OBJETO USUARIO
    let usuario: Usuario;

    if (usuarioToEdit) {
      // Lógica de Edición: Mantenemos la contraseña antigua si no se ha escrito una nueva
      const finalPassword = password.trim() ? password : usuarioToEdit.password;

      usuario = {
        ...usuarioToEdit,
        nombre,
        correo,
        password: finalPassword, // Usar la nueva o la antigua
      };
    } else {
      // Lógica de Creación
      usuario = {
        id: uuid.v4().toString(),
        nombre,
        correo,
        password,
      };
    }

    // 4. GUARDAR
    onSave(usuario);
  };

  // Función helper para obtener el estilo del input
  const getInputStyle = (fieldName: keyof ErrorState) => [
    styles.input,
    errors[fieldName] && styles.inputError,
  ];

  const getPasswordPlaceholder = usuarioToEdit
    ? "Contraseña (dejar vacío para no cambiar)"
    : "Contraseña";

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
            {usuarioToEdit ? "Editar Usuario" : "Crear Usuario"}
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

          {/* Correo */}
          <TextInput
            placeholder="Correo"
            value={correo}
            onChangeText={(text) => {
              setCorreo(text);
              setErrors({ ...errors, correo: false });
            }}
            style={getInputStyle("correo")}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.correo && (
            <Text style={styles.errorText}>Correo es obligatorio</Text>
          )}

          {/* Contraseña */}
          <TextInput
            placeholder={getPasswordPlaceholder}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: false });
            }}
            style={getInputStyle("password")}
            secureTextEntry // Oculta la entrada de texto
          />
          {errors.password && (
            <Text style={styles.errorText}>Contraseña es obligatoria</Text>
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
    marginBottom: 10,
    padding: 8,
  },
  inputError: {
    borderColor: "red",
    borderWidth: 2,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    marginTop: -8,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});
