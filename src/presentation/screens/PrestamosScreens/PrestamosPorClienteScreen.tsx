import React, { useCallback, useEffect, useState, useMemo } from "react";
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
import { useFocusEffect } from "@react-navigation/native";

// --- CONSTANTES DE PAGINACIÓN ---
const ITEMS_PER_PAGE = 3; // Mostrar 3 préstamos por página

type Props = NativeStackScreenProps<RootStackParamList, "PrestamosPorCliente">;

export default function PrestamosPorClienteScreen({
  route,
  navigation,
}: Props) {
  const { clienteId, clienteNombre } = route.params;
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [prestamoToEdit, setPrestamoToEdit] = useState<Prestamo | null>(null);
  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1); // Página actual

  // 💡 Función para cargar los préstamos, envuelta en useCallback
  const loadPrestamos = useCallback(async () => {
    const data = await PrestamoRepository.search(clienteId);
    setPrestamos(data);
    setCurrentPage(1); // Resetear a la primera página en cada recarga
    console.log("Total préstamos cargados:", data.length); // DEBUG
  }, [clienteId]);

  useFocusEffect(
    useCallback(() => {
      loadPrestamos();
    }, [loadPrestamos])
  );

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
            // Recargar datos y resetear la paginación
            loadPrestamos();
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
    // Recargar datos y resetear la paginación
    loadPrestamos();
    setModalVisible(false);
    setPrestamoToEdit(null);
  };

  function formatDateToDDMMYY(dateStr?: string) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year.slice(2)}`; // ejemplo: 04/10/25
  }

  function calcularTotalAPagar(
    cantidad: number,
    interes: number,
    periodo: number,
    tiempo: string
  ): number {
    let totalDeudaInicial = 0;

    if (tiempo === "Meses") {
      // Interés simple mensual
      const interesMonto = cantidad * (interes / 100);
      totalDeudaInicial = cantidad + periodo * interesMonto;
    } else if (tiempo === "Días") {
      if (periodo < 26) {
        const interesMonto = cantidad * (interes / 100);
        totalDeudaInicial = cantidad + interesMonto;
      } else {
        console.log("El periodo debe ser menor a 26 días");
        totalDeudaInicial = cantidad; // o podrías devolver 0 si quieres marcar error
      }
    }

    return totalDeudaInicial;
  }

  // --- LÓGICA DE PAGINACIÓN ---
  // Calcula los préstamos a mostrar en la página actual
  const paginatedPrestamos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const slicedPrestamos = prestamos.slice(startIndex, endIndex);

    // DEBUG
    console.log(
      `Préstamos mostrados en la página ${currentPage}:`,
      slicedPrestamos.length
    );

    return slicedPrestamos;
  }, [prestamos, currentPage]);

  const totalPages = Math.ceil(prestamos.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderItem = ({ item }: { item: Prestamo }) => {
    // 💡 APLICACIÓN DE LA FUNCIÓN DE CÁLCULO
    const totalCalculado = calcularTotalAPagar(
      item.cantidad,
      item.interes,
      item.periodo,
      item.tiempo
    );
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Total a Pagar:</Text>
          {/* Usamos el color de Total Pendiente/Pagado del Canvas */}
          <Text
            style={[
              styles.value,
              item.deudaStatus ? styles.totalPendiente : styles.totalPagado,
            ]}
          >
            {item.moneda}
            {totalCalculado.toFixed(2)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Estado:</Text>
          <Text
            style={[
              styles.estado,
              item.deudaStatus ? styles.estadoPendiente : styles.estadoPagado,
            ]}
          >
            {item.deudaStatus ? "Pendiente" : "Pagado"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Fecha de préstamo:</Text>
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
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Préstamos de {clienteNombre}</Text>
      <FlatList
        data={paginatedPrestamos} // USAMOS EL ARRAY PAGINADO
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>
            Este cliente no tiene préstamos registrados.
          </Text>
        )}
      />

      {/* --- CONTROLES DE PAGINACIÓN --- */}
      {prestamos.length > 0 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            onPress={handlePrevPage}
            disabled={currentPage === 1}
            style={[
              styles.paginationButton,
              currentPage === 1 && styles.disabledButton,
            ]}
          >
            <Text style={styles.paginationText}>Anterior</Text>
          </TouchableOpacity>

          <Text style={styles.pageInfo}>
            Página {currentPage} de {totalPages}
          </Text>

          <TouchableOpacity
            onPress={handleNextPage}
            disabled={currentPage === totalPages}
            style={[
              styles.paginationButton,
              currentPage === totalPages && styles.disabledButton,
            ]}
          >
            <Text style={styles.paginationText}>Siguiente</Text>
          </TouchableOpacity>
        </View>
      )}

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
  // 1. Fondo ligeramente gris (f9f9f9)
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f9f9f9",
  },
  // 2. Estilo del título consistente
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
  },
  // 3. Estilo de tarjeta con elevación y borde consistente
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    // Sombra sutil
    shadowColor: "#a5a5a5ff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3", // Azul para el borde de la tarjeta
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontWeight: "600",
    color: "#555",
  },
  value: {
    fontWeight: "600",
    color: "#333",
  },
  // Colores para el Total a Pagar (consistentes con DetallePrestamoScreen)
  totalPendiente: {
    fontWeight: "bold",
    color: "#D32F2F", // Rojo para pendiente
  },
  totalPagado: {
    fontWeight: "bold",
    color: "#4CAF50", // Verde para pagado
  },
  // Colores para el estado (consistentes con DetallePrestamoScreen)
  estado: {
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
    fontSize: 12,
  },
  estadoPendiente: {
    backgroundColor: "#FFF3E0", // Fondo naranja muy claro
    color: "#FF9800", // Naranja (statusActive)
  },
  estadoPagado: {
    backgroundColor: "#E8F5E9", // Fondo verde muy claro
    color: "#4CAF50", // Verde (statusSettled)
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end", // Botones a la derecha
    gap: 20,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  empty: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#888",
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  // --- ESTILOS DE PAGINACIÓN ---
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    marginTop: 10,
  },
  paginationButton: {
    backgroundColor: "#2196F3", // Color azul principal
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  paginationText: {
    color: "white",
    fontWeight: "bold",
  },
  pageInfo: {
    fontSize: 16,
    color: "#333",
  },
});
