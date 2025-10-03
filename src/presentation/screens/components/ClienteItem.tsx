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
import Cliente from "../../../domain/models/Cliente";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../App/navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Clientes">;

interface Props {
  cliente: Cliente;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
}

export default function ClienteItem({ cliente, onEdit, onDelete }: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const handleView = () => {
    setMenuVisible(false);
    const detailsText =
      `Nombre: ${cliente.nombre}\n` +
      `Cédula: ${cliente.cedula}\n` +
      `Dirección: ${cliente.direccion}\n` +
      `Teléfono: ${cliente.numeroTelefono}`;
    Alert.alert("Detalles Cliente", detailsText, [{ text: "Cerrar" }]);
  };

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit(cliente);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    onDelete(cliente.id);
  };

  const handleVerPrestamos = () => {
    setMenuVisible(false);
    navigation.navigate("PrestamosPorCliente", {
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
    });
  };

  const OptionsMenu = () => (
    <Modal animationType="fade" transparent visible={menuVisible}>
      <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuOption} onPress={handleView}>
              <Text style={[styles.menuText, { color: "#2196F3" }]}>
                Ver Detalles de usuario
              </Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.menuOption}
              onPress={handleVerPrestamos}
            >
              <Text style={[styles.menuText, { color: "#FF9800" }]}>
                Ver Préstamos
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
