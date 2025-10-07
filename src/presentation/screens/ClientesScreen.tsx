import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity, // Necesario para los botones de paginación
} from "react-native";
import ClienteRepository from "../../data/repositories/ClienteRepository";
import Cliente from "../../domain/models/Cliente";
import ClienteItem from "./components/ClienteItem";
import ClienteModal from "./components/ClienteModal";

// --- CONSTANTES DE PAGINACIÓN ---
const ITEMS_PER_PAGE = 8;

//  Nuevo componente para la Fila de Encabezados
const ListHeader = () => (
  <View style={headerStyles.headerContainer}>
    {/* Columna Nombre: flex: 1 para ocupar la mayor parte del espacio */}
    <Text style={[headerStyles.headerText, headerStyles.nombreColumn]}>
      Nombre
    </Text>

    {/* Columna Acciones: Ancho fijo para alinearse con el ícono de 3 puntos */}
    <Text style={[headerStyles.headerText, headerStyles.accionesColumn]}>
      Acciones
    </Text>
  </View>
);

export default function ClientesScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | undefined>(
    undefined
  );
  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1); // Página actual

  const loadClientes = useCallback(async () => {
    try {
      const data = await ClienteRepository.getAll();
      setClientes(data);
      setCurrentPage(1); // Resetear a la primera página después de una carga completa
      console.log("Total clientes cargados:", data.length); // DEBUG
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      Alert.alert("Error", "No se pudieron cargar los clientes.");
    }
  }, []);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const handleSearch = async (text: string) => {
    setSearch(text);
    try {
      if (text.trim() === "") {
        loadClientes(); // Recarga y resetea la página
      } else {
        const data = await ClienteRepository.search(text);
        setClientes(data);
        setCurrentPage(1); // Resetear a la primera página con los resultados de búsqueda
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    }
  };

  const handleSave = async (cliente: Cliente) => {
    try {
      if (clienteToEdit) {
        await ClienteRepository.update(cliente);
      } else {
        await ClienteRepository.create(cliente);
      }

      loadClientes(); // Recarga los datos y resetea la paginación
      setModalVisible(false);
      setClienteToEdit(undefined);
      Alert.alert(
        "Éxito",
        `Cliente ${clienteToEdit ? "actualizado" : "creado"} correctamente.`
      );
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      Alert.alert("Error", "Hubo un problema al guardar el cliente.");
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setClienteToEdit(cliente);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      Alert.alert(
        "Confirmar Eliminación",
        "¿Estás seguro de que quieres eliminar este cliente?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            onPress: async () => {
              await ClienteRepository.delete(id);
              loadClientes(); // Recarga y resetea la paginación
              Alert.alert("Éxito", "Cliente eliminado correctamente.");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error al eliminar:", error);
      Alert.alert("Error", "Hubo un problema al eliminar el cliente.");
    }
  };

  // --- LÓGICA DE PAGINACIÓN ---
  // Calcula los clientes a mostrar en la página actual
  const paginatedClientes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const slicedClientes = clientes.slice(startIndex, endIndex);

    // DEBUG
    console.log(
      `Clientes mostrados en la página ${currentPage}:`,
      slicedClientes.length
    );

    return slicedClientes;
  }, [clientes, currentPage]);

  const totalPages = Math.ceil(clientes.length / ITEMS_PER_PAGE);

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

  // --- Renderizado ---
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Buscar por nombre o cédula"
        value={search}
        onChangeText={handleSearch}
        style={styles.input}
      />
      <Button
        title="Crear Nuevo Cliente"
        onPress={() => {
          setModalVisible(true);
          setClienteToEdit(undefined);
        }}
      />
      <FlatList
        data={paginatedClientes} // USAMOS EL ARRAY PAGINADO
        keyExtractor={(item) => item.id}
        // Renderizamos la cabecera aquí
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <ClienteItem
            cliente={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>
            {search.trim() !== ""
              ? "No se encontraron resultados para la búsqueda."
              : "No hay clientes registrados."}
          </Text>
        )}
      />

      {/* --- CONTROLES DE PAGINACIÓN --- */}
      {clientes.length > 0 && ( // Muestra si hay al menos 1 cliente
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

      <ClienteModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setClienteToEdit(undefined);
        }}
        onSave={handleSave}
        clienteToEdit={clienteToEdit}
      />
    </View>
  );
}

// Estilos del Encabezado (con margen superior aplicado)
const headerStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#e0e0e0", // Fondo del encabezado
    borderBottomWidth: 1,
    borderColor: "#b0b0b0",
    // 🚀 CAMBIO APLICADO: Separación del botón
    marginTop: 15,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  nombreColumn: {
    flex: 1, // Ocupa la mayor parte del espacio
  },
  accionesColumn: {
    textAlign: "right",
    width: 60, // Este valor debe alinearse con el espacio ocupado por el ícono
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  // --- ESTILOS DE PAGINACIÓN (Añadidos) ---
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
    backgroundColor: "#007bff",
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
