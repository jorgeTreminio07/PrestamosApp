import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator, // 👈 Importado para el estado de carga
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

// Asume que las funciones de tu repositorio están en este path
import {
  getArqueoCajaPorDia,
  getAbonosPorRangoFechas,
  getPrestamosPorRangoFechas,
  getClientesAtrasados,
} from "../../../data/repositories/ReportesRepository";

// Define un tipo para identificar el reporte
type ReporteId = 1 | 2 | 3 | 4;

const ReportesScreen = () => {
  // Estado para controlar el modal de selección de fechas
  const [modalVisible, setModalVisible] = useState(false);
  // Estado para el ID del reporte que se va a generar
  const [currentReporteId, setCurrentReporteId] = useState<ReporteId | null>(
    null
  );

  // Estados para las fechas
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFinal, setFechaFinal] = useState(new Date());
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFinal, setShowPickerFinal] = useState(false);

  // ⭐️ Estado de Carga
  const [isLoading, setIsLoading] = useState(false);

  const reportes = [
    { id: 1, nombre: "Arqueo de caja" },
    { id: 2, nombre: "Abonos Realizados" },
    { id: 3, nombre: "Préstamos Realizados" },
    { id: 4, nombre: "Clientes Atrasados" },
  ];

  /**
   * Formatea una fecha a string 'YYYY-MM-DD'
   * @param date Objeto Date
   * @returns String de fecha
   */
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // --- Funciones de Manejo de Fechas ---

  const onChangeFechaInicio = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || fechaInicio;
    setShowPickerInicio(Platform.OS === "ios");
    setFechaInicio(currentDate);
  };

  const onChangeFechaFinal = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || fechaFinal;
    setShowPickerFinal(Platform.OS === "ios");
    setFechaFinal(currentDate);
  };

  // --- Lógica de Generación de Reportes ---

  const exportToExcel = async (data: any[], fileName: string) => {
    try {
      if (!data || data.length === 0) {
        Alert.alert("Exportar a Excel", "No hay datos para exportar.");
        return;
      }

      // Crear hoja de cálculo
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte");

      // Generar archivo en base64
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      // Guardar archivo en el sistema
      const uri = (FileSystem as any).cacheDirectory + `${fileName}.xlsx`;
      await FileSystem.writeAsStringAsync(uri, wbout, {
        encoding: "base64",
      });

      // Compartir archivo
      await Sharing.shareAsync(uri, {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Exportar reporte a Excel",
        UTI: "com.microsoft.excel.xlsx",
      });
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      Alert.alert("Error", "No se pudo exportar el reporte.");
    }
  };

  /**
   * Genera el reporte actual basado en las fechas seleccionadas
   */
  const generateReporte = async () => {
    if (!currentReporteId) return;

    setModalVisible(false);
    setIsLoading(true); // ⭐️ Activar carga

    try {
      let results;
      const fInicio = formatDate(fechaInicio);
      const fFinal = formatDate(fechaFinal);

      switch (currentReporteId) {
        case 1: // Arqueo de caja
          results = await getArqueoCajaPorDia(fInicio);
          Alert.alert(
            "Reporte Generado",
            `Arqueo de Caja del ${fInicio}: ${results.length} registros.`
          );
          await exportToExcel(results, `Arqueo_${fInicio}`);
          break;

        case 2: // Abonos Realizados
          results = await getAbonosPorRangoFechas(fInicio, fFinal);
          Alert.alert(
            "Reporte Generado",
            `Abonos de ${fInicio} a ${fFinal}: ${results.length} registros.`
          );
          await exportToExcel(results, `Abonos_${fInicio}_a_${fFinal}`);
          break;

        case 3: // Préstamos Realizados
          results = await getPrestamosPorRangoFechas(fInicio, fFinal);
          Alert.alert(
            "Reporte Generado",
            `Préstamos de ${fInicio} a ${fFinal}: ${results.length} registros.`
          );
          await exportToExcel(results, `Prestamos_${fInicio}_a_${fFinal}`);
          break;

        default:
          break;
      }
      console.log("Resultados del reporte:", results);
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      Alert.alert("Error", "Ocurrió un error al cargar los datos del reporte.");
    } finally {
      setIsLoading(false); // ⭐️ Desactivar carga
    }
  };

  /**
   * Maneja la acción de click en el botón "Generar"
   * @param id ID del reporte
   */
  const handleAccion = async (id: ReporteId) => {
    setCurrentReporteId(id);

    switch (id) {
      case 1: // Arqueo de caja (Requiere una sola fecha)
      case 2: // Abonos Realizados (Requiere rango de fechas)
      case 3: // Préstamos Realizados (Requiere rango de fechas)
        // Restablece las fechas por defecto antes de mostrar el modal (opcional, pero buena práctica)
        setFechaInicio(new Date());
        setFechaFinal(new Date());
        setModalVisible(true);
        break;
      case 4: // Clientes Atrasados (Llama directamente a la función)
        console.log("Generando reporte de Clientes Atrasados...");
        setIsLoading(true); // ⭐️ Activar carga
        try {
          const results = await getClientesAtrasados();
          console.log("Resultados Clientes Atrasados:", results);
          Alert.alert(
            "Reporte Generado",
            `Clientes Atrasados: ${results.length} registros encontrados.`
          );
          // **Aquí se implementaría la navegación a la pantalla de resultados**
        } catch (error) {
          console.error("Error al generar Clientes Atrasados:", error);
          Alert.alert(
            "Error",
            "No se pudo cargar el reporte de Clientes Atrasados."
          );
        } finally {
          setIsLoading(false); // ⭐️ Desactivar carga
        }
        break;
      default:
        break;
    }
  };

  // --- Componente Modal de Selección de Fechas ---
  const DateSelectionModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            {currentReporteId === 1
              ? "Seleccionar Fecha de Arqueo"
              : "Seleccionar Rango de Fechas"}
          </Text>

          {/* Selector de Fecha de Inicio/Única */}
          <Text style={styles.dateLabel}>
            {currentReporteId === 1 ? "Fecha Única:" : "Fecha Inicial:"}
          </Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowPickerInicio(true)}
            disabled={isLoading}
          >
            <Text>{formatDate(fechaInicio)}</Text>
            <Feather name="calendar" size={20} color="#6c757d" />
          </TouchableOpacity>
          {showPickerInicio && (
            <DateTimePicker
              testID="dateTimePickerInicio"
              value={fechaInicio}
              mode="date"
              display="default"
              onChange={onChangeFechaInicio}
            />
          )}

          {/* Selector de Fecha Final (Solo si no es Arqueo de Caja) */}
          {currentReporteId !== 1 && (
            <>
              <Text style={styles.dateLabel}>Fecha Final:</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowPickerFinal(true)}
                disabled={isLoading}
              >
                <Text>{formatDate(fechaFinal)}</Text>
                <Feather name="calendar" size={20} color="#6c757d" />
              </TouchableOpacity>
              {showPickerFinal && (
                <DateTimePicker
                  testID="dateTimePickerFinal"
                  value={fechaFinal}
                  mode="date"
                  display="default"
                  onChange={onChangeFechaFinal}
                  minimumDate={fechaInicio} // Asegura que la fecha final sea >= a la inicial
                />
              )}
            </>
          )}

          {/* Botones de Acción */}
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonClose]}
              onPress={() => setModalVisible(false)}
              disabled={isLoading}
            >
              <Text style={styles.textStyle}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonGenerar]}
              onPress={generateReporte}
              disabled={isLoading}
            >
              <Text style={styles.textStyle}>Generar Reporte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reportes Disponibles 📊</Text>

      {/* ⭐️ Indicador de carga visible sobre la pantalla */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Cargando reporte...</Text>
        </View>
      )}

      <View style={styles.table}>
        {reportes.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={() => handleAccion(item.id as ReporteId)}
              disabled={isLoading} // ⭐️ Deshabilitar si está cargando
            >
              <Feather name="file-text" size={20} color="#fff" />
              <Text style={styles.buttonText}>Generar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <DateSelectionModal />
    </ScrollView>
  );
};

// --- Estilos Actualizados ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  table: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: "#dee2e6",
  },
  nombre: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff", // Color azul primario para el botón
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },
  // ⭐️ Estilos de Carga y Deshabilitado
  loadingOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Fondo semi-transparente
    zIndex: 10, // Asegura que esté por encima de todo
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  buttonDisabled: {
    backgroundColor: "#adb5bd", // Color gris para indicar que está deshabilitado
  },
  // --- Estilos del Modal ---
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro semi-transparente
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 35,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  dateLabel: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 5,
    marginTop: 10,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    backgroundColor: "#f8f9fa",
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    borderRadius: 6,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonGenerar: {
    backgroundColor: "#28a745", // Verde
  },
  buttonClose: {
    backgroundColor: "#dc3545", // Rojo
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ReportesScreen;
