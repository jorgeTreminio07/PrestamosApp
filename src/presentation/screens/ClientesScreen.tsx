import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  Text,
} from "react-native";
import ClienteRepository from "../../data/repositories/ClienteRepository";
import Cliente from "../../domain/models/Cliente";
import ClienteItem from "./components/ClienteItem";
import ClienteModal from "./components/ClienteModal";

// 💡 Nuevo componente para la Fila de Encabezados
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

  const loadClientes = useCallback(async () => {
    try {
      const data = await ClienteRepository.getAll();
      setClientes(data);
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
        loadClientes();
      } else {
        const data = await ClienteRepository.search(text);
        setClientes(data);
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

      loadClientes();
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
              loadClientes();
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
        data={clientes}
        keyExtractor={(item) => item.id}
        // 💡 Renderizamos la cabecera aquí
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <ClienteItem
            cliente={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No hay clientes registrados.</Text>
        )}
      />
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

// 💡 Estilos del Encabezado (con margen superior aplicado)
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
});
