import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../App/navigation/AppNavigator";
import PrestamoRepository from "../../../data/repositories/PrestamoRepository";
import Prestamo from "../../../domain/models/Prestamo";
import { Feather } from "@expo/vector-icons";
import PrestamoModal from "../components/Prestamo/PretamoModal";

type Props = NativeStackScreenProps<RootStackParamList, "PrestamosPorCliente">;

export default function PrestamosPorClienteScreen({
  route,
  navigation,
}: Props) {
  const { clienteId, clienteNombre } = route.params;
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [prestamoToEdit, setPrestamoToEdit] = useState<Prestamo | null>(null);

  useEffect(() => {
    PrestamoRepository.search(clienteId).then(setPrestamos);
  }, [clienteId]);

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Eliminar Préstamo",
      "¿Seguro que deseas eliminar este préstamo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await PrestamoRepository.delete(id);
            const actualizados = await PrestamoRepository.search(clienteId);
            setPrestamos(actualizados);
          },
        },
      ]
    );
  };

  const handleEdit = (prestamo: Prestamo) => {
    setPrestamoToEdit(prestamo);
    setModalVisible(true);
  };

  const handleSave = async (prestamoEditado: Prestamo) => {
    await PrestamoRepository.update(prestamoEditado);
    const actualizados = await PrestamoRepository.search(clienteId);
    setPrestamos(actualizados);
    setModalVisible(false);
    setPrestamoToEdit(null);
  };

  function formatDateToDDMMYY(dateStr?: string) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year.slice(2)}`; // ejemplo: 04/10/25
  }

  const renderItem = ({ item }: { item: Prestamo }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Total a Pagar:</Text>
        <Text style={styles.value}>
          {item.moneda}
          {item.totalPagar.toFixed(2)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Estado:</Text>
        <Text
          style={[
            styles.estado,
            item.deudaStatus ? styles.estadoRojo : styles.estadoVerde,
          ]}
        >
          {item.deudaStatus ? "Pendiente" : "Pagado"}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Fecha de prestamo:</Text>
        <Text style={styles.value}>
          {formatDateToDDMMYY(item.datePrestamo)}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("DetallePrestamo", { prestamoId: item.id })
          }
        >
          <Feather name="eye" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Feather name="edit" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Feather name="trash-2" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Préstamos de {clienteNombre}</Text>
      <FlatList
        data={prestamos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>
            Este cliente no tiene préstamos registrados.
          </Text>
        )}
      />
      <PrestamoModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setPrestamoToEdit(null);
        }}
        onSave={handleSave}
        clientes={[
          {
            id: clienteId,
            nombre: clienteNombre,
            cedula: "",
            direccion: "",
            numeroTelefono: "",
          },
        ]}
        prestamoToEdit={prestamoToEdit ?? undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontWeight: "600",
  },
  value: {
    fontWeight: "bold",
  },
  estado: {
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  estadoRojo: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  estadoVerde: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
});
