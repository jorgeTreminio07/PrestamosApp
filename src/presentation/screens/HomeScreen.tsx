import React, { useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import MenuCard from "./components/MenuCard";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App/navigation/AppNavigator";

// 💡 Extendemos las Props para incluir la función de cerrar sesión
type Props = NativeStackScreenProps<RootStackParamList, "Home"> & {
  onLogout: () => void;
};

// 💡 Desestructuramos 'onLogout' de las props
export default function HomeScreen({ navigation, onLogout }: Props) {
  // 💡 Configurar el botón de Logout en el Header
  useEffect(() => {
    navigation.setOptions({
      // Usamos headerRight para colocar un componente a la derecha del encabezado
      headerRight: () => (
        <TouchableOpacity onPress={onLogout} style={headerStyles.logoutButton}>
          <Text style={headerStyles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      ),
      // Puedes añadir headerTitle: 'Menú Principal' si lo necesitas
    });
  }, [navigation, onLogout]); // Aseguramos que se re-ejecute si cambia la navegación o la función de logout

  return (
    <View style={styles.container}>
      <MenuCard
        title="Clientes"
        iconName="person"
        onPress={() => navigation.navigate("Clientes")}
      />
      <MenuCard
        title="Usuarios"
        iconName="group"
        onPress={() => navigation.navigate("Usuarios")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

const headerStyles = StyleSheet.create({
  logoutButton: {
    backgroundColor: "#e74c3c", // Fondo rojo para el botón
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10, // Margen derecho para separarlo del borde
    // Opcional: un poco de sombra para realzar
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  logoutText: {
    color: "#FFFFFF", // Texto blanco
    fontWeight: "bold",
    fontSize: 14,
  },
});
