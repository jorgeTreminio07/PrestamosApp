import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../App/navigation/AppNavigator";
import PrestamoRepository from "../../../data/repositories/PrestamoRepository";
import Prestamo from "../../../domain/models/Prestamo";
import { Feather } from "@expo/vector-icons";
import PrestamoModal from "../components/Prestamo/PretamoModal";
import { useFocusEffect } from "@react-navigation/native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import AbonoRepository from "../../../data/repositories/AbonoRepository";
import ClienteRepository from "../../../data/repositories/ClienteRepository";
import ConfiguracionRepository from "../../../data/repositories/ConfiguracionesRepository";

const ITEMS_PER_PAGE = 3;

type Props = NativeStackScreenProps<RootStackParamList, "PrestamosPorCliente">;

export default function PrestamosPorClienteScreen({
  route,
  navigation,
}: Props) {
  const { clienteId, clienteNombre } = route.params;
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [prestamoToEdit, setPrestamoToEdit] = useState<Prestamo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadPrestamos = useCallback(async () => {
    const data = await PrestamoRepository.search(clienteId);
    setPrestamos(data);
    setCurrentPage(1);
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
    loadPrestamos();
    setModalVisible(false);
    setPrestamoToEdit(null);
  };

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
      const interesMonto = cantidad * (interes / 100);
      totalDeudaInicial = cantidad + periodo * interesMonto;
    } else if (tiempo === "Días") {
      if (periodo < 26) {
        const interesMonto = cantidad * (interes / 100);
        totalDeudaInicial = cantidad + interesMonto;
      } else {
        totalDeudaInicial = cantidad;
      }
    }

    return totalDeudaInicial;
  }

  const paginatedPrestamos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return prestamos.slice(startIndex, endIndex);
  }, [prestamos, currentPage]);

  const totalPages = Math.ceil(prestamos.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // 📄 Generar y compartir PDF con abonos reales
  const handleGenerateAndSharePDF = async (item: Prestamo) => {
    try {
      const cliente = await ClienteRepository.findById(item.clienteId);
      const abonos = await AbonoRepository.getByPrestamoId(item.id);
      const configuraciones = await ConfiguracionRepository.get();

      const total = calcularTotalAPagar(
        item.cantidad,
        item.interes,
        item.periodo,
        item.tiempo
      );

      let saldo = total;
      const filasAbonos = abonos
        .sort(
          (a, b) =>
            new Date(a.dateAbono).getTime() - new Date(b.dateAbono).getTime()
        )
        .map((abono) => {
          saldo -= abono.cantidadAbono;
          return `
          <tr>
            <td style="padding:5px; text-align:center;">${formatDateToDDMMYY(
              abono.dateAbono
            )}</td>
            <td style="padding:5px; text-align:center;">C$ ${abono.cantidadAbono.toLocaleString(
              "es-NI",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}</td>
            <td style="padding:5px; text-align:center;">C$ ${saldo.toLocaleString(
              "es-NI",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}</td>
          </tr>
        `;
        })
        .join("");

      const tablaAbonos =
        abonos.length > 0
          ? filasAbonos
          : `<tr><td colspan="3" style="text-align:center;">Sin registros aún</td></tr>`;

      const htmlContent = `
      <html>
        <body style="font-family: Arial; padding: 20px; border: 2px solid #000;">
          <h2 style="text-align:center;">${configuraciones?.nombreEmpresa}</h2>
          <p><b>Dir.:</b>${configuraciones?.direccion}</p>
          <p><b>Resp.:</b> ${configuraciones?.nombreResponsable}</p>
          <p><b>Telefono Responsable.:</b> ${configuraciones?.telefono}</p>
          <hr />
          <p><b>Nombre:</b> ${cliente?.nombre || clienteNombre}</p>
          <p><b>N° Teléfono:</b> ${
            cliente?.numeroTelefono || "___________________________"
          }</p>
          <p><b>Dirección:</b> ${
            cliente?.direccion || "___________________________"
          }</p>
          <p><b>Monto:</b> C$ ${item.cantidad.toLocaleString("es-NI", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}</p>
          <p><b>Interés:</b> ${item.interes}%</p>
          <p><b>Periodo:</b> ${item.periodo} ${item.tiempo}</p>
          <p><b>Total a Pagar:</b> C$ ${total.toLocaleString("es-NI", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}</p>
          <p><b>Fecha Préstamo:</b> ${formatDateToDDMMYY(item.datePrestamo)}</p>
          <br/>
          <table style="width:100%; border-collapse: collapse;" border="1">
            <tr style="background:#f0f0f0;">
              <th style="padding:5px;">Fecha</th>
              <th style="padding:5px;">Abono</th>
              <th style="padding:5px;">Saldo</th>
            </tr>
            ${tablaAbonos}
          </table>
          <br/><br/>
          <p style="text-align:center;">${configuraciones?.frase}</p>
          <p style="text-align:right;">Firma: _____________________</p>
        </body>
      </html>
    `;

      // Generar archivo PDF temporal
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // Compartir el archivo
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Compartir PDF de abonos",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Error generando PDF:", error);
      Alert.alert("Error", "No se pudo generar o compartir el PDF.");
    }
  };

  function calcularDemora(fechaVencimiento: string): number {
    if (!fechaVencimiento) return 0;

    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);

    const hoySinHora = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    );
    const vencSinHora = new Date(
      vencimiento.getFullYear(),
      vencimiento.getMonth(),
      vencimiento.getDate()
    );

    const diffTime = hoySinHora.getTime() - vencSinHora.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  const renderItem = ({ item }: { item: Prestamo }) => {
    const totalCalculado = calcularTotalAPagar(
      item.cantidad,
      item.interes,
      item.periodo,
      item.tiempo
    );

    const demoraDias = calcularDemora(item.fechaVencimiento);

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Total a Pagar:</Text>
          <Text
            style={[
              styles.value,
              item.deudaStatus ? styles.totalPendiente : styles.totalPagado,
            ]}
          >
            {item.moneda}
            {totalCalculado.toLocaleString("es-NI", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Estado:</Text>
          <Text
            style={[
              styles.estado,
              demoraDias > 0
                ? styles.demora
                : item.deudaStatus
                ? styles.estadoPendiente
                : styles.estadoPagado,
            ]}
          >
            {demoraDias > 0
              ? "Atrasado"
              : item.deudaStatus
              ? "Pendiente"
              : "Pagado (Saldado)"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha de préstamo:</Text>
          <Text style={styles.value}>
            {formatDateToDDMMYY(item.datePrestamo)}
          </Text>
        </View>
        <View style={styles.actions}>
          {/* Botón Exportar PDF a la izquierda */}
          <TouchableOpacity
            onPress={() => handleGenerateAndSharePDF(item)}
            style={{ marginRight: "auto" }} // Empuja los demás a la derecha
          >
            <Feather name="file-text" size={20} color="#9C27B0" />
          </TouchableOpacity>

          {/* Botones a la derecha */}
          <View style={{ flexDirection: "row", gap: 15 }}>
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
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Préstamos de {clienteNombre}</Text>
      <FlatList
        data={paginatedPrestamos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>
            Este cliente no tiene préstamos registrados.
          </Text>
        )}
      />

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
  container: { flex: 1, padding: 15, backgroundColor: "#f9f9f9" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#a5a5a5ff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 6,
    borderLeftColor: "#2196F3",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: { fontWeight: "600", color: "#555" },
  value: { fontWeight: "600", color: "#333" },
  totalPendiente: { fontWeight: "bold", color: "#D32F2F" },
  totalPagado: { fontWeight: "bold", color: "#4CAF50" },
  estado: {
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 12,
  },
  estadoPendiente: { backgroundColor: "#FFF3E0", color: "#FF9800" },
  estadoPagado: { backgroundColor: "#E8F5E9", color: "#4CAF50" },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
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
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  paginationButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  disabledButton: { backgroundColor: "#ccc" },
  paginationText: { color: "white", fontWeight: "bold" },
  pageInfo: { fontSize: 16, color: "#333" },
  demora: {
    backgroundColor: "#fbd5d5ff",
    color: "#E53935",
  },
});
