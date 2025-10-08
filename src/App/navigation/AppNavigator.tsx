import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../../presentation/screens/HomeScreen";
import ClientesScreen from "../../presentation/screens/ClientesScreen";
import UsuariosScreen from "../../presentation/screens/UsuariosScreens/UsuariosScreen";
import PrestamosPorClienteScreen from "../../presentation/screens/PrestamosScreens/PrestamosPorClienteScreen";
import DetallePrestamoScreen from "../../presentation/screens/PrestamosScreens/DetallePrestamoScreen";
import HistorialAbonosScreen from "../../presentation/screens/AbonosScreens/HistorialAbonosScreen";
import ConfiguracionesScreen from "../../presentation/screens/ConfiguracionesScreens/ConfiguracionesScreen";
import ReportesScreen from "../../presentation/screens/ReportesScreens/ReportesScreen";
import BackupScreen from "../../presentation/screens/BackupScreens/BackupScreen";

export type RootStackParamList = {
  Home: undefined;
  Clientes: undefined;
  Usuarios: undefined;
  PrestamosPorCliente: { clienteId: string; clienteNombre: string };
  DetallePrestamo: { prestamoId: string };
  HistorialAbonos: { prestamoId: string };
  Configuraciones: undefined;
  Reportes: undefined;
  Backup: undefined;
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
          options={{ title: "" }}
          component={PrestamosPorClienteScreen}
        />
        <Stack.Screen
          name="DetallePrestamo"
          component={DetallePrestamoScreen}
        />

        <Stack.Screen
          name="HistorialAbonos"
          component={HistorialAbonosScreen}
          options={{ title: "" }}
        />

        <Stack.Screen
          name="Configuraciones"
          component={ConfiguracionesScreen}
          options={{ title: "Configuración de la Empresa" }}
        />

        <Stack.Screen
          name="Reportes"
          component={ReportesScreen}
          options={{ title: " " }}
        />

        <Stack.Screen
          name="Backup"
          component={BackupScreen}
          options={{ title: " " }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
