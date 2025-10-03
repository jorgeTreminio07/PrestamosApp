import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App/navigation/AppNavigator";
import PrestamoRepository from "../../data/repositories/PrestamoRepository";
import Prestamo from "../../domain/models/Prestamo";

type Props = NativeStackScreenProps<RootStackParamList, "DetallePrestamo">;

export default function DetallePrestamoScreen({ route }: Props) {
  const { prestamoId } = route.params;
  const [prestamo, setPrestamo] = useState<Prestamo | null>(null);

  useEffect(() => {
    PrestamoRepository.getById(prestamoId).then(setPrestamo);
  }, [prestamoId]);

  if (!prestamo) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Préstamo no encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle del Préstamo</Text>
      <Text style={styles.item}>Cliente: {prestamo.clienteNombre}</Text>
      <Text style={styles.item}>Cantidad: ${prestamo.cantidad.toFixed(2)}</Text>
      <Text style={styles.item}>Interés: {prestamo.interes}%</Text>
      <Text style={styles.item}>
        Total a Pagar: ${prestamo.totalPagar.toFixed(2)}
      </Text>
      <Text style={styles.item}>
        Fecha de Préstamo: {prestamo.datePrestamo}
      </Text>
      <Text style={styles.item}>
        Fecha de Vencimiento: {prestamo.fechaVencimiento}
      </Text>
      <Text style={styles.item}>
        Periodo: {prestamo.periodo} {prestamo.tiempo}
      </Text>
      <Text style={styles.item}>
        Estado: {prestamo.deudaStatus ? "Pendiente" : "Pagado"}
      </Text>
      {prestamo.demoraDias > 0 && (
        <Text style={styles.item}>Demora: {prestamo.demoraDias} días</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  item: {
    fontSize: 16,
    marginBottom: 8,
  },
  error: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
});
