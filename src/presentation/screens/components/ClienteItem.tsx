import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
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
  const [detalleVisible, setDetalleVisible] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const handleView = () => {
    setMenuVisible(false);
    setDetalleVisible(true);
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
                Ver Detalles de Cliente
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
              <Text style={[styles.menuText, { color: "#fff" }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const DetalleClienteModal = () => (
    <Modal visible={detalleVisible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.detalleContainer}>
          <View style={styles.header}>
            <Feather name="user" size={26} color="#2196F3" />
            <Text style={styles.titulo}>Detalles del Cliente</Text>
          </View>

          <View style={styles.detalleItem}>
            <Text style={styles.label}>👤 Nombre:</Text>
            <Text style={styles.value}>{cliente.nombre}</Text>
          </View>
          <View style={styles.detalleItem}>
            <Text style={styles.label}>🪪 Cédula:</Text>
            <Text style={styles.value}>{cliente.cedula}</Text>
          </View>
          <View style={styles.detalleItem}>
            <Text style={styles.label}>🏠 Dirección:</Text>
            <Text style={styles.value}>{cliente.direccion}</Text>
          </View>
          <View style={styles.detalleItem}>
            <Text style={styles.label}>📞 Teléfono:</Text>
            <Text style={styles.value}>{cliente.numeroTelefono}</Text>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setDetalleVisible(false)}
          >
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
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
      <DetalleClienteModal />
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
    fontWeight: "600",
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
    paddingVertical: 12,
  },
  // === Detalle bonito ===
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  detalleContainer: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 15,
    padding: 25,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  detalleItem: {
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    fontSize: 16,
    color: "#222",
    marginTop: 2,
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#2196F3",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
