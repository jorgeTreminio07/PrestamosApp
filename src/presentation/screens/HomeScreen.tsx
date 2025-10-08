import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import MenuCard from "./components/MenuCard";
import PrestamoModal from "./components/Prestamo/PretamoModal";
import PrestamoRepository from "../../data/repositories/PrestamoRepository";
import ClienteRepository from "../../data/repositories/ClienteRepository";
import Cliente from "../../domain/models/Cliente";
import Prestamo from "../../domain/models/Prestamo";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App/navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Home"> & {
  onLogout: () => void;
};

export default function HomeScreen({ navigation, onLogout }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mensajeExito, setMensajeExito] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onLogout} style={headerStyles.logoutButton}>
          <Text style={headerStyles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, onLogout]);

  useEffect(() => {
    ClienteRepository.getAll().then(setClientes);
  }, []);

  const handleGuardarPrestamo = async (prestamo: Prestamo) => {
    await PrestamoRepository.create(prestamo);
    setMensajeExito(true);
    setTimeout(() => setMensajeExito(false), 2000);
  };

  const cargarClientes = async () => {
    const lista = await ClienteRepository.getAll();
    setClientes(lista);
  };

  return (
    <View style={styles.container}>
      <MenuCard
        title="Clientes"
        iconName="person"
        onPress={() => navigation.navigate("Clientes")}
      />
      <MenuCard
        title="Nuevo Préstamo"
        iconName="attach-money"
        onPress={() => {
          cargarClientes(); // ✅ recarga la lista
          setModalVisible(true);
        }}
      />
      <MenuCard
        title="Reportes"
        iconName="assessment"
        onPress={() => navigation.navigate("Reportes")}
      />

      <MenuCard
        title="Usuarios"
        iconName="group"
        onPress={() => navigation.navigate("Usuarios")}
      />

      <MenuCard
        title="Ajustes"
        iconName="settings" // Icono de perno
        onPress={() => navigation.navigate("Configuraciones")}
      />

      <PrestamoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleGuardarPrestamo}
        clientes={clientes}
      />

      {mensajeExito && (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>
            ✅ Préstamo guardado correctamente
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingTop: 60,
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
});

const headerStyles = StyleSheet.create({
  logoutButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
