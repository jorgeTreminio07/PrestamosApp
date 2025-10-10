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
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import {
  getArqueoCajaPorDia,
  getAbonosPorRangoFechas,
  getPrestamosPorRangoFechas,
  getClientesAtrasados,
} from "../../../data/repositories/ReportesRepository";

type ReporteId = 1 | 2 | 3 | 4;

const ReportesScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentReporteId, setCurrentReporteId] = useState<ReporteId | null>(
    null
  );

  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFinal, setFechaFinal] = useState(new Date());
  const [isDatePickerVisibleInicio, setDatePickerVisibleInicio] =
    useState(false);
  const [isDatePickerVisibleFinal, setDatePickerVisibleFinal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const reportes = [
    { id: 1, nombre: "Arqueo de abonos diario" },
    { id: 2, nombre: "Abonos Realizados" },
    { id: 3, nombre: "Préstamos Realizados" },
    { id: 4, nombre: "Clientes Atrasados" },
  ];

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Modal DatePicker Inicio
  const showDatePickerInicio = () => setDatePickerVisibleInicio(true);
  const hideDatePickerInicio = () => setDatePickerVisibleInicio(false);
  const handleConfirmInicio = (date: Date) => {
    setFechaInicio(date);
    hideDatePickerInicio();
  };

  // Modal DatePicker Final
  const showDatePickerFinal = () => setDatePickerVisibleFinal(true);
  const hideDatePickerFinal = () => setDatePickerVisibleFinal(false);
  const handleConfirmFinal = (date: Date) => {
    setFechaFinal(date);
    hideDatePickerFinal();
  };

  // --- Exportar a Excel con diseño y totales ---
  const exportToExcel = async (
    data: any[],
    fileName: string,
    tipoReporte: string
  ) => {
    try {
      if (!data || data.length === 0) {
        Alert.alert("Exportar a Excel", "No hay datos para exportar.");
        return;
      }

      const ws = XLSX.utils.json_to_sheet(data);
      ws["!cols"] = Object.keys(data[0] || {}).map((key) => ({
        wch:
          Math.max(
            key.length,
            ...data.map((row) => (row[key] ? String(row[key]).length : 0))
          ) + 2,
      }));

      const range = XLSX.utils.decode_range(ws["!ref"]!);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "007bff" } },
          alignment: { horizontal: "center" },
        };
      }

      let campoSuma = "";
      if (tipoReporte === "abonos") campoSuma = "cantidadAbono";
      else if (tipoReporte === "prestamos") campoSuma = "cantidadPrestada";
      else if (tipoReporte === "arqueo") campoSuma = "abono";

      const totalCordobas = data
        .filter((row) => row.moneda === "C$")
        .reduce((sum, row) => sum + (Number(row[campoSuma]) || 0), 0);

      const totalDolares = data
        .filter((row) => row.moneda === "$")
        .reduce((sum, row) => sum + (Number(row[campoSuma]) || 0), 0);

      const lastRow = range.e.r + 5;

      ws[`C${lastRow}`] = {
        v: `Totales ${tipoReporte} C$`,
        s: { font: { bold: true } },
      };
      ws[`D${lastRow}`] = { v: totalCordobas, t: "n", z: "#,##0.00" };

      ws[`C${lastRow + 1}`] = {
        v: `Totales ${tipoReporte} $`,
        s: { font: { bold: true } },
      };
      ws[`D${lastRow + 1}`] = { v: totalDolares, t: "n", z: "#,##0.00" };

      const newRange = {
        s: { c: range.s.c, r: range.s.r },
        e: { c: range.e.c, r: lastRow + 1 },
      };
      ws["!ref"] = XLSX.utils.encode_range(newRange);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte");

      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      const uri = (FileSystem as any).cacheDirectory + `${fileName}.xlsx`;
      await FileSystem.writeAsStringAsync(uri, wbout, { encoding: "base64" });

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

  const generateReporte = async () => {
    if (!currentReporteId) return;
    setModalVisible(false);
    setIsLoading(true);

    try {
      let results;
      const fInicio = formatDate(fechaInicio);
      const fFinal = formatDate(fechaFinal);

      switch (currentReporteId) {
        case 1:
          results = await getArqueoCajaPorDia(fInicio);
          Alert.alert(
            "Reporte Generado",
            `Arqueo de Caja del ${fInicio}: ${results.length} registros.`
          );
          await exportToExcel(results, `Arqueo_${fInicio}`, "arqueo");
          break;
        case 2:
          results = await getAbonosPorRangoFechas(fInicio, fFinal);
          Alert.alert(
            "Reporte Generado",
            `Abonos de ${fInicio} a ${fFinal}: ${results.length} registros.`
          );
          await exportToExcel(
            results,
            `Abonos_${fInicio}_a_${fFinal}`,
            "abonos"
          );
          break;
        case 3:
          results = await getPrestamosPorRangoFechas(fInicio, fFinal);
          Alert.alert(
            "Reporte Generado",
            `Préstamos de ${fInicio} a ${fFinal}: ${results.length} registros.`
          );
          await exportToExcel(
            results,
            `Prestamos_${fInicio}_a_${fFinal}`,
            "prestamos"
          );
          break;
      }
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      Alert.alert("Error", "Ocurrió un error al cargar los datos del reporte.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccion = async (id: ReporteId) => {
    setCurrentReporteId(id);

    switch (id) {
      case 1:
      case 2:
      case 3:
        setFechaInicio(new Date());
        setFechaFinal(new Date());
        setModalVisible(true);
        break;
      case 4:
        setIsLoading(true);
        try {
          const results = await getClientesAtrasados();
          Alert.alert(
            "Reporte Generado",
            `Clientes Atrasados: ${results.length} registros encontrados.`
          );
          await exportToExcel(
            results,
            `Clientes_Atrasados_${formatDate(new Date())}`,
            ""
          );
        } catch (error) {
          console.error("Error al generar Clientes Atrasados:", error);
          Alert.alert(
            "Error",
            "No se pudo cargar el reporte de Clientes Atrasados."
          );
        } finally {
          setIsLoading(false);
        }
        break;
    }
  };

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

          <Text style={styles.dateLabel}>
            {currentReporteId === 1 ? "Fecha Única:" : "Fecha Inicial:"}
          </Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={showDatePickerInicio}
            disabled={isLoading}
          >
            <Text>{formatDate(fechaInicio)}</Text>
            <Feather name="calendar" size={20} color="#6c757d" />
          </TouchableOpacity>

          {currentReporteId !== 1 && (
            <>
              <Text style={styles.dateLabel}>Fecha Final:</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={showDatePickerFinal}
                disabled={isLoading}
              >
                <Text>{formatDate(fechaFinal)}</Text>
                <Feather name="calendar" size={20} color="#6c757d" />
              </TouchableOpacity>
            </>
          )}

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
              <Text style={styles.textStyle}>Generar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Date Pickers modales */}
      <DateTimePickerModal
        isVisible={isDatePickerVisibleInicio}
        mode="date"
        onConfirm={handleConfirmInicio}
        onCancel={hideDatePickerInicio}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisibleFinal}
        mode="date"
        onConfirm={handleConfirmFinal}
        onCancel={hideDatePickerFinal}
        minimumDate={fechaInicio}
      />
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reportes Disponibles</Text>

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
              disabled={isLoading}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
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
  nombre: { fontSize: 16, color: "#333", flex: 1 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 10,
  },
  loadingText: { marginTop: 10, fontSize: 16, color: "#333" },
  buttonDisabled: { backgroundColor: "#adb5bd" },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 35,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
  dateLabel: { fontSize: 14, color: "#6c757d", marginBottom: 5, marginTop: 10 },
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
  buttonGenerar: { backgroundColor: "#28a745" },
  buttonClose: { backgroundColor: "#dc3545" },
  textStyle: { color: "white", fontWeight: "bold", textAlign: "center" },
});

export default ReportesScreen;
