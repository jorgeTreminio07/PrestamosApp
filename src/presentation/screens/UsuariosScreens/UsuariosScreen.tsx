// ./src/screens/UsuariosScreen/UsuariosScreen.tsx

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
// 💡 IMPORTACIONES ACTUALIZADAS
import UsuarioRepository from "../../../data/repositories/UsuarioRepository";
import Usuario from "../../../domain/models/Usuario";
import UserItem from "../components/Users/UserItem"; // Asumiendo esta ruta
import UserModal from "../components/Users/UserModal"; // Asumiendo esta ruta

// 💡 Componente de Encabezados (sin cambios en estilo)
const ListHeader = () => (
  <View style={headerStyles.headerContainer}>
    <Text style={[headerStyles.headerText, headerStyles.nombreColumn]}>
      Nombre
    </Text>
    <Text style={[headerStyles.headerText, headerStyles.accionesColumn]}>
      Acciones
    </Text>
  </View>
);

// 💡 NOMBRE DEL COMPONENTE ACTUALIZADO
export default function UsuariosScreen() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]); // 💡 Estado para usuarios
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | undefined>( // 💡 Estado para edición
    undefined
  );

  // 💡 Lógica para cargar usuarios
  const loadUsuarios = useCallback(async () => {
    try {
      const data = await UsuarioRepository.getAll();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      Alert.alert("Error", "No se pudieron cargar los usuarios.");
    }
  }, []);

  useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  // 💡 Lógica de búsqueda
  const handleSearch = async (text: string) => {
    setSearch(text);
    try {
      if (text.trim() === "") {
        loadUsuarios();
      } else {
        // Usamos el search del UsuarioRepository
        const data = await UsuarioRepository.search(text);
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    }
  };

  // 💡 Lógica de guardado
  const handleSave = async (usuario: Usuario) => {
    try {
      if (usuarioToEdit) {
        await UsuarioRepository.update(usuario);
      } else {
        await UsuarioRepository.create(usuario);
      }

      loadUsuarios();
      setModalVisible(false);
      setUsuarioToEdit(undefined);
      Alert.alert(
        "Éxito",
        `Usuario ${usuarioToEdit ? "actualizado" : "creado"} correctamente.`
      );
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      Alert.alert("Error", "Hubo un problema al guardar el usuario.");
    }
  };

  // 💡 Lógica de edición
  const handleEdit = (usuario: Usuario) => {
    setUsuarioToEdit(usuario);
    setModalVisible(true);
  };

  // 💡 Lógica de eliminación
  const handleDelete = async (id: string) => {
    try {
      Alert.alert(
        "Confirmar Eliminación",
        "¿Estás seguro de que quieres eliminar este usuario?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            onPress: async () => {
              await UsuarioRepository.delete(id);
              loadUsuarios();
              Alert.alert("Éxito", "Usuario eliminado correctamente.");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error al eliminar:", error);
      Alert.alert("Error", "Hubo un problema al eliminar el usuario.");
    }
  };

  // --- Renderizado ---
  return (
    <View style={styles.container}>
      <TextInput
        // 💡 Placeholder actualizado
        placeholder="Buscar por nombre o correo"
        value={search}
        onChangeText={handleSearch}
        style={styles.input}
      />
      <Button
        title="Crear Nuevo Usuario" // 💡 Título actualizado
        onPress={() => {
          setModalVisible(true);
          setUsuarioToEdit(undefined);
        }}
      />
      <FlatList
        data={usuarios} // 💡 Usamos el estado de usuarios
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <UserItem // 💡 Usamos UserItem
            usuario={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No hay usuarios registrados.</Text>
        )}
      />
      <UserModal // 💡 Usamos UserModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setUsuarioToEdit(undefined);
        }}
        onSave={handleSave}
        usuarioToEdit={usuarioToEdit} // 💡 Pasamos el usuario a editar
      />
    </View>
  );
}

// 💡 Estilos del Encabezado (sin cambios)
const headerStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#e0e0e0",
    borderBottomWidth: 1,
    borderColor: "#b0b0b0",
    marginTop: 15,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  nombreColumn: {
    flex: 1,
  },
  accionesColumn: {
    textAlign: "right",
    width: 60,
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
