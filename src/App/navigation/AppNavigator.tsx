import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../../presentation/screens/HomeScreen";
import ClientesScreen from "../../presentation/screens/ClientesScreen";
import UsuariosScreen from "../../presentation/screens/UsuariosScreens/UsuariosScreen";
import PrestamosPorClienteScreen from "../../presentation/screens/PrestamosScreens/PrestamosPorClienteScreen";
import DetallePrestamoScreen from "../../presentation/screens/PrestamosScreens/DetallePrestamoScreen";

export type RootStackParamList = {
  Home: undefined;
  Clientes: undefined;
  Usuarios: undefined;
  PrestamosPorCliente: { clienteId: string; clienteNombre: string };
  DetallePrestamo: { prestamoId: string };
};

interface AppNavigatorProps {
  onLogout: () => void;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({ onLogout }: AppNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" options={{ title: "Menú Principal" }}>
          {(props) => <HomeScreen {...props} onLogout={onLogout} />}
        </Stack.Screen>
        <Stack.Screen name="Clientes" component={ClientesScreen} />
        <Stack.Screen name="Usuarios" component={UsuariosScreen} />
        <Stack.Screen
          name="PrestamosPorCliente"
          component={PrestamosPorClienteScreen}
        />
        <Stack.Screen
          name="DetallePrestamo"
          component={DetallePrestamoScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
