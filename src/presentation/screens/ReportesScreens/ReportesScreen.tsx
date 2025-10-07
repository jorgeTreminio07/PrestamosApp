import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const ReportesScreen = () => {
  const reportes = [
    { id: 1, nombre: "Arqueo de caja" },
    { id: 2, nombre: "Abonos Realizados" },
    { id: 3, nombre: "Préstamos Realizados" },
    { id: 4, nombre: "Clientes Atrasados" },
  ];

  const handleAccion = (id: number) => {
    switch (id) {
      case 1:
        console.log("Abrir reporte de Arqueo de caja");
        break;
      case 2:
        console.log("Abrir reporte de Abonos");
        break;
      case 3:
        console.log("Abrir reporte de Préstamos");
        break;
      case 4:
        console.log("Abrir reporte de Clientes atrasados");
        break;
      default:
        break;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reportes Disponibles</Text>

      <View style={styles.table}>
        {reportes.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleAccion(item.id)}
            >
              <Feather name="file-text" size={20} color="#fff" />
              <Text style={styles.buttonText}>Generar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

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
    backgroundColor: "#2196F3",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },
});

export default ReportesScreen;
