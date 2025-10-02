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

export default function ClientesScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | undefined>(
    undefined
  );

  // 💡 1. Convertimos a una función asíncrona y usamos useCallback para estabilidad
  const loadClientes = useCallback(async () => {
    try {
      // 💡 Usamos await para esperar el Promise
      const data = await ClienteRepository.getAll();
      setClientes(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      Alert.alert("Error", "No se pudieron cargar los clientes.");
    }
  }, []); // Dependencias vacías, solo se crea una vez

  // 💡 2. Usamos useEffect para cargar los datos al inicio
  useEffect(() => {
    loadClientes();
  }, [loadClientes]); // Agregamos loadClientes como dependencia del hook

  // 💡 3. Hacemos handleSearch asíncrono
  const handleSearch = async (text: string) => {
    setSearch(text);
    try {
      if (text.trim() === "") {
        // Si la búsqueda está vacía, cargamos todos los clientes
        loadClientes();
      } else {
        // De lo contrario, buscamos
        const data = await ClienteRepository.search(text);
        setClientes(data);
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    }
  };

  // 💡 4. Hacemos handleSave asíncrono y manejamos create/update
  const handleSave = async (cliente: Cliente) => {
    try {
      if (clienteToEdit) {
        // Actualizar
        await ClienteRepository.update(cliente);
      } else {
        // Crear
        await ClienteRepository.create(cliente);
      }

      // Una vez completada la operación (await), recargamos la lista y cerramos el modal
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

  // 💡 5. Hacemos handleDelete asíncrono
  const handleDelete = async (id: string) => {
    try {
      // Confirmación antes de eliminar (opcional, pero buena práctica)
      Alert.alert(
        "Confirmar Eliminación",
        "¿Estás seguro de que quieres eliminar este cliente?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            onPress: async () => {
              // Esperamos a que la eliminación termine
              await ClienteRepository.delete(id);
              // Luego recargamos
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
        renderItem={({ item }) => (
          <ClienteItem
            cliente={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        // Opcional: mostrar un mensaje si la lista está vacía
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
