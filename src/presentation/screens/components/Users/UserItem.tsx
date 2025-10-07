// ./src/screens/UsuariosScreen/components/UserItem.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import Usuario from "../../../../domain/models/Usuario";
import { Feather } from "@expo/vector-icons"; // Asegúrate de que este import sea correcto para tu entorno (Expo o RN CLI)

interface Props {
  usuario: Usuario;
  onEdit: (usuario: Usuario) => void;
  onDelete: (id: string) => void;
}

export default function UserItem({ usuario, onEdit, onDelete }: Props) {
  const [menuVisible, setMenuVisible] = useState(false);

  // 💡 Función para ver los detalles del usuario
  const handleView = () => {
    setMenuVisible(false);

    // NOTA: No mostramos la contraseña real aquí (aunque sea hash, es sensible).
    const detailsText =
      `Nombre: ${usuario.nombre}\n` +
      `Correo: ${usuario.correo}\n` +
      `Contraseña (hash): [Oculta por seguridad]`; // Indicamos que el campo existe

    Alert.alert(`Detalles Usuario`, detailsText, [{ text: "Cerrar" }]);
  };

  // 💡 Función para editar
  const handleEdit = () => {
    setMenuVisible(false);
    onEdit(usuario);
  };

  // 💡 Función para eliminar
  const handleDelete = () => {
    setMenuVisible(false);
    onDelete(usuario.id);
  };

  // --- Componente del Menú de Opciones ---
  const OptionsMenu = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={menuVisible}
      onRequestClose={() => setMenuVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
        {/* Contenedor principal que oscurece el fondo */}
        <View style={styles.modalOverlay}>
          {/* El cuadro de opciones */}
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuOption} onPress={handleView}>
              <Text style={[styles.menuText, { color: "#2196F3" }]}>
                Ver Detalles de Usuario
              </Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.menuOption} onPress={handleEdit}>
              <Text style={[styles.menuText, { color: "#4CAF50" }]}>
                Editar
              </Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.menuOption} onPress={handleDelete}>
              <Text style={[styles.menuText, { color: "#f44336" }]}>
                Eliminar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuOption, styles.cancelButton]}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={[styles.menuText, { color: "#fff" }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{usuario.nombre}</Text>

      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        style={styles.optionsButton}
      >
        <Feather name="more-vertical" size={24} color="#333" />
      </TouchableOpacity>

      <OptionsMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  optionsButton: {
    padding: 5,
    marginLeft: 10,
  },
  // --- Estilos del Modal del Menú ---
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuBox: {
    backgroundColor: "white",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: "100%",
  },
  menuOption: {
    paddingVertical: 15,
    alignItems: "center",
  },
  menuText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    width: "100%",
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#888",
    borderRadius: 10,
  },
});
