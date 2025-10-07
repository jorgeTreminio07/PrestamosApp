import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity, // Importado para los botones de paginación
} from "react-native";
// 💡 IMPORTACIONES ACTUALIZADAS
import UsuarioRepository from "../../../data/repositories/UsuarioRepository";
import Usuario from "../../../domain/models/Usuario";
import UserItem from "../components/Users/UserItem"; // Asumiendo esta ruta
import UserModal from "../components/Users/UserModal"; // Asumiendo esta ruta

// --- CONSTANTES DE PAGINACIÓN ---
const ITEMS_PER_PAGE = 8;

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
  const [usuarios, setUsuarios] = useState<Usuario[]>([]); // 💡 Estado para usuarios (TODOS los usuarios)
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | undefined>(
    undefined
  );
  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1); // Página actual

  // 💡 Lógica para cargar usuarios
  const loadUsuarios = useCallback(async () => {
    try {
      const data = await UsuarioRepository.getAll();
      setUsuarios(data);
      setCurrentPage(1); // Resetear a la primera página después de una carga completa
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
        loadUsuarios(); // Ya resetea la página
      } else {
        // Usamos el search del UsuarioRepository
        const data = await UsuarioRepository.search(text);
        setUsuarios(data);
        setCurrentPage(1); // Resetear a la primera página con los resultados de búsqueda
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    }
  };

  // 💡 Lógica de guardado (sin cambios relevantes en paginación)
  const handleSave = async (usuario: Usuario) => {
    try {
      if (usuarioToEdit) {
        await UsuarioRepository.update(usuario);
      } else {
        await UsuarioRepository.create(usuario);
      }

      loadUsuarios(); // Recarga los datos y resetea la paginación
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
              loadUsuarios(); // Recarga y resetea la paginación
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

  // --- LÓGICA DE PAGINACIÓN ---
  // Calcula los usuarios a mostrar en la página actual
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return usuarios.slice(startIndex, endIndex);
  }, [usuarios, currentPage]);

  const totalPages = Math.ceil(usuarios.length / ITEMS_PER_PAGE);

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
        // Usamos el arreglo PAGINADO como fuente de datos
        data={paginatedUsers}
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
          <Text style={styles.emptyText}>
            {search.trim() !== ""
              ? "No se encontraron resultados para la búsqueda."
              : "No hay usuarios registrados."}
          </Text>
        )}
      />

      {/* --- CONTROLES DE PAGINACIÓN --- */}
      {usuarios.length > 0 && ( // 💡 CAMBIO: Mostrar si hay al menos 1 usuario para ver el contador de página
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
