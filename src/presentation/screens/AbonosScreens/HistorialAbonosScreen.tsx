import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../App/navigation/AppNavigator";
import Abono from "../../../domain/models/Abono";
import AbonoRepository from "../../../data/repositories/AbonoRepository";
import { useFocusEffect } from "@react-navigation/native"; // 💡 Importar useFocusEffect para recarga

type Props = NativeStackScreenProps<RootStackParamList, "HistorialAbonos">;

export default function HistorialAbonosScreen({ route }: Props) {
  // Nota: Estos tipos de parámetros dependen de la correcta definición en AppNavigator.tsx
  const { prestamoId } = route.params;
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAbonos = useCallback(async () => {
    setLoading(true);
    try {
      // Usamos el Repositorio de Abonos para obtener los registros por ID de Préstamo
      const data = await AbonoRepository.getByPrestamoId(prestamoId);
      setAbonos(data);
    } catch (error) {
      console.error("Error al cargar abonos:", error);
    } finally {
      setLoading(false);
    }
  }, [prestamoId]);

  // 💡 Usamos useFocusEffect para recargar la lista cada vez que la pantalla está enfocada.
  // Esto asegura que la lista se actualice automáticamente si el usuario regresa tras un abono.
  useFocusEffect(
    useCallback(() => {
      fetchAbonos();
    }, [fetchAbonos])
  );

  function formatDateToDDMMYY(dateStr?: string) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year.slice(2)}`;
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Abonos Registrados</Text>

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
              <View>
                <Text style={styles.abonoAmount}>
                  Abono: $ {item.cantidadAbono.toFixed(2)}
                </Text>
                <Text style={styles.abonoDate}>
                  Fecha: {formatDateToDDMMYY(item.dateAbono)}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

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
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  abonoItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  evenBackground: {
    backgroundColor: "#e6e6fa", // Lavanda suave
  },
  oddBackground: {
    backgroundColor: "#fff",
  },
  abonoAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF", // Azul primario
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
});
