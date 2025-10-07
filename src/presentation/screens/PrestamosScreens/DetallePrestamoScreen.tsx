import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Button,
  Modal, // Importado para usar un modal nativo
  TextInput, // Importado para capturar la cantidad
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../App/navigation/AppNavigator";
import PrestamoRepository from "../../../data/repositories/PrestamoRepository";
import Prestamo from "../../../domain/models/Prestamo";
import { MaterialIcons } from "@expo/vector-icons"; // Usamos iconos de Expo
import { useFocusEffect } from "@react-navigation/native";

type Props = NativeStackScreenProps<RootStackParamList, "DetallePrestamo">;

// --- Componente Modal para Abonos ---
interface AbonoModalProps {
  isVisible: boolean;
  // initialAmount se usa para edición, por defecto 0 para registro.
  initialAmount?: number;
  onClose: () => void;
  onSave: (amount: number) => void;
  title: string;
}

const AbonoInputModal = ({
  isVisible,
  initialAmount = 0,
  onClose,
  onSave,
  title,
}: AbonoModalProps) => {
  const [amount, setAmount] = useState(
    String(initialAmount > 0 ? initialAmount : "")
  );

  // Sincroniza el monto inicial cuando el modal se abre o el contexto cambia
  useEffect(() => {
    // Solo actualiza si el modal está visible para evitar limpiar el input mientras se escribe
    if (isVisible) {
      setAmount(String(initialAmount > 0 ? initialAmount : ""));
    }
  }, [initialAmount, isVisible]);

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Error", "Por favor, introduce una cantidad válida.");
      return;
    }
    // Llama a la función de guardado pasada por props
    onSave(parsedAmount);
    // Cierra y el estado 'amount' se manejará por el useEffect/setAmount
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
          <Text style={modalStyles.modalText}>
            Introduce la cantidad del abono:
          </Text>
          <TextInput
            style={modalStyles.input}
            onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))} // Permite solo números y punto decimal
            value={amount}
            placeholder="0.00"
            keyboardType="numeric"
            autoFocus={true}
          />
          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity
              style={[modalStyles.modalButton, { backgroundColor: "#888" }]}
              onPress={onClose}
            >
              <Text style={modalStyles.textStyle}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.modalButton, { backgroundColor: "#4CAF50" }]}
              onPress={handleSave}
            >
              <Text style={modalStyles.textStyle}>Guardar Abono</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
// ------------------------------------

export default function DetallePrestamoScreen({ route, navigation }: Props) {
  const { prestamoId } = route.params;
  const [prestamo, setPrestamo] = useState<Prestamo | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Estado para el modal de abonos
  const [isAbonoModalVisible, setIsAbonoModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("Registrar Nuevo Abono");
  // Aquí se guardaría el abono que se está editando (para futura implementación de edición)
  const [abonoToEdit, setAbonoToEdit] = useState<{
    id: string;
    cantidad: number;
  } | null>(null);

  // Función para cargar los datos del préstamo
  const loadPrestamo = useCallback(async () => {
    // 💡 LOG DE DEBUG para confirmar la recarga
    console.log(
      `[DEBUG] Recargando datos de préstamo al enfocar: ${prestamoId}`
    );

    const data = await PrestamoRepository.getById(prestamoId);
    setPrestamo(data);
    setRefreshing(false);
  }, [prestamoId]);

  // 💡 USAMOS useFocusEffect: Se ejecuta cada vez que la pantalla está enfocada.
  useFocusEffect(
    useCallback(() => {
      // Al enfocarse, iniciamos la recarga del préstamo
      loadPrestamo();
      // Retornar una función de limpieza es opcional aquí, pero buena práctica
      return () => {
        // Lógica de limpieza si es necesaria al desenfocar
      };
    }, [loadPrestamo])
  );

  // Función para abrir el modal de nuevo abono
  const handleOpenNewAbonoModal = () => {
    // Configura el modal para un nuevo registro
    setModalTitle("Registrar Nuevo Abono");
    setAbonoToEdit(null); // Indica que no estamos editando
    setIsAbonoModalVisible(true);
  };

  // Función que maneja el guardado desde el modal (reemplaza la lógica de Alert.prompt)
  const handleSaveAbono = (amount: number) => {
    // Cerrar el modal inmediatamente para mostrar el indicador de carga
    setIsAbonoModalVisible(false);

    // Lógica de validación de monto pendiente
    if (prestamo && amount > prestamo.totalPagar) {
      Alert.alert(
        "Advertencia",
        `El monto ingresado ($${amount.toFixed(
          2
        )}) es mayor al saldo pendiente ($${prestamo.totalPagar.toFixed(
          2
        )}). No se puede registrar el abono.`
      );

      return;
    }

    // Si estamos editando un abono (lógica futura)
    if (abonoToEdit) {
      // Aquí iría la llamada a AbonoRepository.update(abonoToEdit.id, amount, new Date().toISOString())
      console.log(`[EDITAR] Abono ${abonoToEdit.id} con cantidad ${amount}`);
      // Por ahora, solo es placeholder.
      setRefreshing(true); // Activar refreshing para simular la carga
      // Simular un retraso para el feedback visual, luego recargar:
      setTimeout(() => loadPrestamo(), 1000);
    } else {
      // Lógica para registrar un *nuevo* abono
      setRefreshing(true);
      PrestamoRepository.makePayment(prestamoId, amount) // El repositorio se encarga de la fecha automática
        .then(() => {
          loadPrestamo(); // Recarga los datos del préstamo
        })
        .catch((error) => {
          console.error("Error al registrar abono:", error);
          Alert.alert("Error", "No se pudo registrar el abono.");
          setRefreshing(false);
        });
    }
  };

  // Navega a la pantalla de historial (solo se usa en el header)
  const handleViewAbonos = () => {
    navigation.navigate("HistorialAbonos", { prestamoId: prestamoId });
  };

  // 💡 CONFIGURACIÓN DE BOTONES EN EL ENCABEZADO
  useLayoutEffect(() => {
    if (prestamo) {
      navigation.setOptions({
        headerTitle: "",
        headerRight: () => (
          <View style={styles.headerButtons}>
            {/* Botón para Ver Historial de Abonos (Icono) */}
            <TouchableOpacity
              onPress={handleViewAbonos}
              style={[
                styles.headerButton,
                {
                  backgroundColor: "#2196F3",
                  flexDirection: "row", // 👈 Icono y texto en fila
                  alignItems: "center", // 👈 Centra verticalmente
                  paddingHorizontal: 10, // 👈 Espacio a los lados
                  width: "auto", // Se adapta al contenido
                },
              ]}
            >
              <MaterialIcons name="history" size={24} color="white" />
              <Text style={{ color: "white", fontSize: 12, marginLeft: 6 }}>
                Historial de abonos
              </Text>
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [navigation, prestamo, handleOpenNewAbonoModal, handleViewAbonos]);

  if (!prestamo || refreshing) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>
          Cargando préstamo o registrando abono...
        </Text>
      </View>
    );
  }

  function formatDateToDDMMYY(dateStr?: string) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year.slice(2)}`;
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

  const totalAPagar = calcularTotalAPagar(
    prestamo.cantidad,
    prestamo.interes,
    prestamo.periodo,
    prestamo.tiempo
  );

  function cuota(periodo: number, totalPagar: number, tiempo: string) {
    let cuotaPorDia = 0;

    if (tiempo.toLowerCase() === "meses") {
      // Si es por meses: total dividido entre meses, luego entre 26 días
      const cuotaMensual = totalPagar / periodo;
      cuotaPorDia = cuotaMensual / 26;
    } else if (tiempo.toLowerCase() === "días") {
      // Si es por días: total dividido entre periodo
      cuotaPorDia = totalPagar / periodo;
    }

    return cuotaPorDia;
  }

  const cuotaPorDia = cuota(prestamo.periodo, totalAPagar, prestamo.tiempo);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información del Préstamo</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Cliente:</Text>
          <Text style={styles.value}>{prestamo.clienteNombre}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Cantidad Original:</Text>
          <Text style={styles.value}>
            {prestamo.moneda}
            {prestamo.cantidad.toFixed(2)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Interés:</Text>
          <Text style={styles.value}>{prestamo.interes}%</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Total a Pagar:</Text>
          <Text style={[styles.value, styles.highlightBlue]}>
            {prestamo.moneda}
            {totalAPagar.toFixed(2)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Total Pendiente:</Text>
          <Text style={[styles.value, styles.highlightRed]}>
            {prestamo.moneda}
            {prestamo.totalPagar.toFixed(2)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Monto Abonado:</Text>
          <Text style={[styles.value, styles.highlightGreen]}>
            {prestamo.moneda}
            {prestamo.montoPagado.toFixed(2)}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.label}>Fecha de Préstamo:</Text>
          <Text style={styles.value}>
            {formatDateToDDMMYY(prestamo.datePrestamo)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Fecha de Vencimiento:</Text>
          <Text style={styles.value}>
            {formatDateToDDMMYY(prestamo.fechaVencimiento)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Periodo:</Text>
          <Text style={styles.value}>
            {prestamo.periodo} {prestamo.tiempo}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Estado:</Text>
          <Text
            style={[
              styles.value,
              prestamo.deudaStatus ? styles.statusActive : styles.statusSettled,
            ]}
          >
            {prestamo.deudaStatus ? "Pendiente" : "Pagado (Saldado)"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Cuota por día:</Text>
          <Text style={styles.value}>
            {prestamo.moneda}
            {cuotaPorDia.toFixed(2)}
          </Text>
        </View>

        {prestamo.demoraDias > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Demora:</Text>
            <Text style={[styles.value, styles.demora]}>
              {prestamo.demoraDias} días
            </Text>
          </View>
        )}
      </View>

      <View style={styles.bottomActions}>
        {/* Botón Principal: Registrar Abono (Verde) */}
        <Button
          title="Registrar Nuevo Abono"
          onPress={handleOpenNewAbonoModal} // Ahora abre el modal
          color="#4CAF50"
        />
      </View>

      {/* -------------------- MODAL DE INGRESO DE ABONO -------------------- */}
      <AbonoInputModal
        isVisible={isAbonoModalVisible}
        title={modalTitle}
        initialAmount={abonoToEdit ? abonoToEdit.cantidad : 0}
        onClose={() => setIsAbonoModalVisible(false)}
        onSave={handleSaveAbono}
      />
      {/* -------------------------------------------------------------------- */}
    </View>
  );
}

// Estilos específicos para el Modal
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente
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
    backgroundColor: "#F3F6FB",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E88E5",
    marginBottom: 12,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: "#6B7280", // gris suave
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "700", // Dato en negrita
  },
  highlightBlue: {
    color: "#1E88E5",
  },
  highlightRed: {
    color: "#E53935",
  },
  highlightGreen: {
    color: "#43A047",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginVertical: 12,
  },
  statusActive: {
    color: "#FB8C00",
  },
  statusSettled: {
    color: "#4CAF50",
  },
  demora: {
    color: "#E53935",
  },
  bottomActions: {
    marginTop: 25,
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerButton: {
    padding: 8,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 45,
    height: 45,
  },
  error: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
    marginRight: 5,
  },
});
