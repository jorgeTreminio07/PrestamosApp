import React, { useMemo } from "react";
import { Modal, View, Text, StyleSheet, Button } from "react-native";
import Prestamo, { Moneda, Tiempo } from "../../../../domain/models/Prestamo";

// Definición de Props para el nuevo modal
interface Props {
  visible: boolean;
  onClose: () => void;
  // Propiedades necesarias para la cotización
  cantidad: string;
  interes: string;
  periodo: string;
  tiempo: Tiempo;
  moneda: Moneda;
}

// Funciones de cálculo (replicadas de DetallePrestamoScreen para la cotización)
function calcularTotalAPagar(
  cantidad: number,
  interes: number,
  periodo: number,
  tiempo: Tiempo
): number {
  let totalDeudaInicial = 0;

  if (tiempo === "Meses") {
    // Interés simple mensual
    const interesMonto = cantidad * (interes / 100);
    totalDeudaInicial = cantidad + periodo * interesMonto;
  } else if (tiempo === "Días") {
    if (periodo < 26) {
      // Si es por días, el interés se aplica una sola vez (como indica la lógica original)
      const interesMonto = cantidad * (interes / 100);
      totalDeudaInicial = cantidad + interesMonto;
    } else {
      // Manejo de error para periodos > 25 días si el tiempo es "Días"
      // En un caso real, podrías lanzar un error o devolver 0
      console.log(
        "Error: El periodo debe ser menor a 26 días si el tiempo es 'Días'"
      );
      totalDeudaInicial = 0;
    }
  }

  return totalDeudaInicial;
}

function calcularCuota(
  periodo: number,
  totalPagar: number,
  tiempo: Tiempo
): number {
  if (totalPagar <= 0 || periodo <= 0) return 0;

  let cuotaPorDia = 0;

  if (tiempo === "Meses") {
    // Si es por meses: total dividido entre meses, luego entre 26 días (lógica de la cuota diaria)
    const cuotaMensual = totalPagar / periodo;
    cuotaPorDia = cuotaMensual / 26;
  } else if (tiempo === "Días") {
    // Si es por días: total dividido entre periodo
    cuotaPorDia = totalPagar / periodo;
  }

  return cuotaPorDia;
}

/**
 * Modal para mostrar la cotización del préstamo en tiempo real.
 */
export default function CotizacionModal({
  visible,
  onClose,
  cantidad,
  interes,
  periodo,
  tiempo,
  moneda,
}: Props) {
  // Convertir las props de string a number, si son inválidas, usar 0
  const numCantidad = parseFloat(cantidad) || 0;
  const numInteres = parseFloat(interes) || 0;
  const numPeriodo = parseInt(periodo) || 0;

  // Usamos useMemo para calcular los valores solo cuando cambian las dependencias
  const totalAPagar = useMemo(() => {
    // Asegurarse de que los campos son válidos antes de calcular
    if (numCantidad <= 0 || numPeriodo <= 0) return 0;
    return calcularTotalAPagar(numCantidad, numInteres, numPeriodo, tiempo);
  }, [numCantidad, numInteres, numPeriodo, tiempo]);

  const cuotaPorDia = useMemo(() => {
    if (totalAPagar <= 0) return 0;
    return calcularCuota(numPeriodo, totalAPagar, tiempo);
  }, [numPeriodo, totalAPagar, tiempo]);

  // Validar si los campos esenciales están completos para cotizar
  const canCotizar = numCantidad > 0 && numInteres >= 0 && numPeriodo > 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Cotización</Text>

          {canCotizar ? (
            <View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Cantidad Prestada:</Text>
                <Text style={styles.value}>
                  {moneda} {numCantidad.toFixed(2)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Interés:</Text>
                <Text style={styles.value}>{numInteres.toFixed(2)}%</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Periodo:</Text>
                <Text style={styles.value}>
                  {numPeriodo} {tiempo}
                </Text>
              </View>

              <View style={styles.separator} />

              <View style={styles.detailRow}>
                <Text style={styles.labelTotal}>TOTAL A PAGAR:</Text>
                <Text style={styles.valueTotal}>
                  {moneda} {totalAPagar.toFixed(2)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.labelTotal}>Cuota Diaria Estimada:</Text>
                <Text style={styles.valueTotal}>
                  {moneda} {cuotaPorDia.toFixed(2)}
                </Text>
              </View>

              <Text style={styles.message}>
                *Esta es una cotización basada en los valores actuales.
              </Text>
            </View>
          ) : (
            <Text style={styles.errorText}>
              Por favor, complete los campos "Cantidad Prestada", "Interés" y
              "Periodo" con valores válidos para ver la cotización.
            </Text>
          )}

          <View style={{ marginTop: 20 }}>
            <Button title="Cerrar" onPress={onClose} color="#888" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 15,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 16,
    color: "#555",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  separator: {
    borderBottomWidth: 2,
    borderBottomColor: "#ddd",
    marginVertical: 15,
  },
  labelTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D32F2F", // Color llamativo para el total
  },
  valueTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D32F2F",
  },
  message: {
    fontSize: 12,
    marginTop: 15,
    textAlign: "center",
    color: "#888",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 10,
  },
});
