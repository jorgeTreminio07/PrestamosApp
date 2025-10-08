import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert, // Usamos Alert para simplicidad en Expo/RN
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather, MaterialIcons } from "@expo/vector-icons";

// IMPORTACIÓN DEL REPOSITORIO REAL
// FIX: La interfaz Abono no está disponible como named export, la definimos aquí para resolver el error TS.
import AbonoRepository from "../../../data/repositories/AbonoRepository";

// --- INTERFAZ DEL MODELO ---
// Definimos la interfaz Abono localmente para evitar el error de importación.
export interface Abono {
  id: string; // Usamos string para UUID
  prestamoId: string; // Relación con el ID del préstamo
  cantidadAbono: number;
  dateAbono: string; // Formato YYYY-MM-DD
}

// --- Componente Modal para Abonos (Estructura de Edición) ---
interface AbonoModalProps {
  isVisible: boolean;
  initialAmount?: number;
  initialDate?: string; // Incluimos la fecha para poder editarla
  onClose: () => void;
  // onSave recibe el ID del abono que se está editando y la nueva cantidad/fecha
  onSave: (abonoId: string, amount: number, date: string) => void;
  title: string;
  abonoId: string;
}

const AbonoInputModal = ({
  isVisible,
  initialAmount = 0,
  initialDate = new Date().toISOString().split("T")[0], // Valor por defecto hoy
  onClose,
  onSave,
  title,
  abonoId,
}: AbonoModalProps) => {
  const [amount, setAmount] = useState(
    String(initialAmount > 0 ? initialAmount : "")
  );
  // El campo de fecha debe estar en formato YYYY-MM-DD
  const [dateAbono, setDateAbono] = useState(initialDate);

  useEffect(() => {
    if (isVisible) {
      // Al abrir el modal, cargamos los valores iniciales
      setAmount(String(initialAmount > 0 ? initialAmount : ""));
      setDateAbono(initialDate);
    }
  }, [initialAmount, initialDate, isVisible]);

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(
        "Error",
        "Por favor, introduce una cantidad válida mayor a cero."
      );
      return;
    }

    // Validación básica del formato de fecha (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateAbono)) {
      Alert.alert("Error", "El formato de fecha debe ser YYYY-MM-DD.");
      return;
    }

    // Llama a la función de guardado con el ID, la nueva cantidad y la fecha
    onSave(abonoId, parsedAmount, dateAbono);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <Text style={modalStyles.modalTitle}>{title}</Text>
          <Text style={modalStyles.modalText}>Cantidad de Abono:</Text>
          <TextInput
            style={modalStyles.input}
            onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))}
            value={amount}
            placeholder="0.00"
            keyboardType="numeric"
            autoFocus={true}
            placeholderTextColor="#A0A0A0"
          />
          {/* Campo para editar la fecha del abono */}
          <Text style={modalStyles.modalText}>
            Fecha del Abono ( Año-Mes-Día):
          </Text>
          <TextInput
            style={modalStyles.input}
            onChangeText={setDateAbono}
            value={dateAbono}
            placeholder="YYYY-MM-DD"
            keyboardType="default"
            placeholderTextColor="#A0A0A0"
          />

          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity
              style={[modalStyles.modalButton, { backgroundColor: "#ccc" }]}
              onPress={onClose}
            >
              <Text style={modalStyles.textStyle}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.modalButton, { backgroundColor: "#4CAF50" }]}
              onPress={handleSave}
            >
              <Text style={modalStyles.textStyle}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function HistorialAbonosScreen({
  route = { params: { prestamoId: "p101" } },
}: any) {
  // Obtenemos el ID del préstamo de los parámetros de la ruta
  const { prestamoId }: { prestamoId: string } = route.params;
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAbonoModalVisible, setIsAbonoModalVisible] = useState(false);
  // abonoToEdit es el abono seleccionado para editar
  const [abonoToEdit, setAbonoToEdit] = useState<Abono | null>(null);

  /**
   * Carga el historial de abonos desde el repositorio.
   */
  const fetchAbonos = useCallback(async () => {
    setLoading(true);
    try {
      //  USANDO EL REPOSITORIO REAL
      const data = await AbonoRepository.getByPrestamoId(prestamoId);
      setAbonos(data);
    } catch (error) {
      console.error("Error al cargar abonos:", error);
      Alert.alert("Error", "No se pudo cargar el historial de abonos.");
      setAbonos([]);
    } finally {
      setLoading(false);
    }
  }, [prestamoId]);

  // Se ejecuta cada vez que la pantalla está enfocada (visible)
  useFocusEffect(
    useCallback(() => {
      fetchAbonos();
    }, [fetchAbonos])
  );

  const handleEditAbono = (abono: Abono) => {
    setAbonoToEdit(abono);
    setIsAbonoModalVisible(true);
  };

  /**
   * Maneja el guardado de la edición del abono.
   */
  const handleSaveEditAbono = async (
    abonoId: string,
    newAmount: number,
    newDate: string
  ) => {
    setIsAbonoModalVisible(false);
    setLoading(true);

    try {
      if (newAmount <= 0) {
        setLoading(false);
        return;
      }

      const updatedAbono: Abono = {
        id: abonoId,
        prestamoId: prestamoId, // Mantenemos el ID del préstamo
        cantidadAbono: newAmount,
        dateAbono: newDate,
      };

      // LLAMADA AL REPOSITORIO: Actualiza la tabla de abonos y el balance del préstamo
      await AbonoRepository.update(updatedAbono);

      Alert.alert(
        "Éxito",
        "Abono actualizado correctamente y balance del préstamo ajustado."
      );

      setAbonoToEdit(null);
      await fetchAbonos(); // Recargar la lista de abonos para reflejar los cambios
    } catch (error) {
      console.error("Error al editar abono:", error);
      Alert.alert("Error", "No se pudo actualizar el abono.");
      setLoading(false);
    }
  };

  const handleDeleteAbono = (abono: Abono) => {
    Alert.alert(
      "Confirmar Eliminación",
      `¿Estás seguro de que quieres eliminar este abono de $${abono.cantidadAbono.toFixed(
        2
      )}? Esto revertirá el pago en el préstamo.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            setLoading(true);
            try {
              //  LLAMADA AL REPOSITORIO: Elimina el abono y ajusta el balance del préstamo
              await AbonoRepository.delete(abono.id);
              Alert.alert(
                "Éxito",
                "Abono eliminado correctamente y balance del préstamo ajustado."
              );
              await fetchAbonos();
            } catch (error) {
              console.error("Error al eliminar abono:", error);
              Alert.alert("Error", "No se pudo eliminar el abono.");
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  /**
   * Formatea la fecha de YYYY-MM-DD a DD/MM/YY
   */
  function formatDateToDDMMYY(dateStr?: string) {
    if (!dateStr || !dateStr.includes("-")) return dateStr || "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year.slice(2)}`;
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: "#666" }}>
          Cargando historial...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Abonos</Text>
      <Text style={styles.subtitle}>Préstamo ID: {prestamoId}</Text>

      {abonos.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            No hay abonos registrados para este préstamo.
          </Text>
        </View>
      ) : (
        <FlatList
          data={abonos}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.abonoItem,
                index % 2 === 0 ? styles.evenBackground : styles.oddBackground,
              ]}
            >
              <View style={styles.abonoDetails}>
                <Text style={styles.abonoAmount}>
                  Abono: $ {item.cantidadAbono.toFixed(2)}
                </Text>
                <Text style={styles.abonoDate}>
                  Fecha: {formatDateToDDMMYY(item.dateAbono)}
                </Text>
              </View>

              <View style={styles.abonoActions}>
                <TouchableOpacity
                  onPress={() => handleEditAbono(item)}
                  style={[styles.actionButton, styles.editButton]}
                >
                  <Feather name="edit" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteAbono(item)}
                  style={[styles.actionButton, styles.deleteButton]}
                >
                  <MaterialIcons name="delete" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/*  MODAL DE EDICIÓN */}
      <AbonoInputModal
        isVisible={isAbonoModalVisible}
        title="Editar Abono"
        abonoId={abonoToEdit?.id || ""}
        initialAmount={abonoToEdit ? abonoToEdit.cantidadAbono : 0}
        initialDate={
          abonoToEdit
            ? abonoToEdit.dateAbono
            : new Date().toISOString().split("T")[0]
        }
        onClose={() => {
          setIsAbonoModalVisible(false);
          setAbonoToEdit(null);
        }}
        onSave={handleSaveEditAbono}
      />
    </View>
  );
}

// Estilos específicos para el Modal
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    alignSelf: "flex-start",
  },
  input: {
    height: 45,
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 18,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f8",
    padding: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  abonoItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 5,
    borderLeftColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  evenBackground: {
    backgroundColor: "#e6f0ff", // Azul muy claro
  },
  oddBackground: {
    backgroundColor: "#fff",
  },
  abonoDetails: {},
  abonoAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  abonoDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  abonoActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  editButton: {
    backgroundColor: "#4CAF50", // Naranja
  },
  deleteButton: {
    backgroundColor: "#D32F2F", // Rojo
  },
});
