import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Alert, // 💡 IMPORTADO: Añadimos Alert para poder personalizar el título
} from "react-native";
import Cliente from "../../../domain/models/Cliente";
// Usamos Feather de react-native-vector-icons (o Expo)
import { Feather } from "@expo/vector-icons";

interface Props {
  cliente: Cliente;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
}

export default function ClienteItem({ cliente, onEdit, onDelete }: Props) {
  // 💡 Estado para controlar la visibilidad del menú de opciones
  const [menuVisible, setMenuVisible] = useState(false);

  // 💡 Función para ver los detalles (corregida para usar Alert.alert)
  const handleView = () => {
    setMenuVisible(false);

    const detailsText =
      `Nombre: ${cliente.nombre}\n` +
      `Cédula: ${cliente.cedula}\n` +
      `Dirección: ${cliente.direccion}\n` +
      `Teléfono: ${cliente.numeroTelefono}`;

    // 💡 CAMBIO CLAVE: Usamos Alert.alert(Título, Mensaje, Botones)
    Alert.alert(
      `Detalles Cliente`, // El encabezado personalizado
      detailsText,
      [{ text: "Cerrar" }] // Botón para cerrar la alerta
    );
  };

  // 💡 Función para editar
  const handleEdit = () => {
    setMenuVisible(false); // Cerrar menú antes de abrir el modal de edición
    onEdit(cliente);
  };

  // 💡 Función para eliminar
  const handleDelete = () => {
    setMenuVisible(false); // Cerrar menú
    onDelete(cliente.id); // Llamar a la función principal de eliminación (con confirmación en el padre)
  };

  // --- Componente del Menú de Opciones ---
  const OptionsMenu = () => (
    <Modal
      animationType="fade" // O 'slide' para un efecto diferente
      transparent={true}
      visible={menuVisible}
      onRequestClose={() => setMenuVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
        {/* Contenedor principal que oscurece el fondo */}
        <View style={styles.modalOverlay}>
          {/* El cuadro de opciones (centrado o en la parte inferior) */}
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuOption} onPress={handleView}>
              <Text style={[styles.menuText, { color: "#2196F3" }]}>
                Ver Detalles
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

            {/* Botón de Cancelar opcional */}
            <TouchableOpacity
              style={[styles.menuOption, styles.cancelButton]}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.menuText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{cliente.nombre}</Text>

      {/* 💡 Nuevo botón de 3 puntos */}
      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        style={styles.optionsButton}
      >
        {/* 💡 Usamos el ícono 'more-vertical' de Feather */}
        <Feather name="more-vertical" size={24} color="#333" />
      </TouchableOpacity>

      {/* 💡 Renderizamos el menú de opciones */}
      <OptionsMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12, // Aumento de padding para mejor tacto
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1, // Permite que el nombre ocupe el espacio
  },
  optionsButton: {
    padding: 5,
    marginLeft: 10,
  },
  // --- Estilos del Modal del Menú ---
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // Coloca el menú en la parte inferior
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente
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
    fontWeight: "normal",
    color: "#333",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    width: "100%",
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
  },
});
