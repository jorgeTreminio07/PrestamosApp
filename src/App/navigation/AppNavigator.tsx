import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../../presentation/screens/HomeScreen";
import ClientesScreen from "../../presentation/screens/ClientesScreen";
import UsuariosScreen from "../../presentation/screens/UsuariosScreen";

export type RootStackParamList = {
  Home: undefined;
  Clientes: undefined;
  Usuarios: undefined;
};

// 💡 1. Definimos las props que recibirá el AppNavigator desde App.tsx
interface AppNavigatorProps {
  onLogout: () => void;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

// 💡 2. Aceptamos la prop onLogout
export default function AppNavigator({ onLogout }: AppNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* 💡 3. Usamos la prop 'children' (o render) para pasar onLogout a HomeScreen */}
        <Stack.Screen name="Home" options={{ title: "Menú Principal" }}>
          {/* La función recibe las props de navegación estándar (navigation, route)
            y las fusionamos con la prop onLogout antes de pasarlas a HomeScreen.
          */}
          {(props) => <HomeScreen {...props} onLogout={onLogout} />}
        </Stack.Screen>

        {/* Las otras pantallas no necesitan onLogout, usamos component normal */}
        <Stack.Screen name="Clientes" component={ClientesScreen} />
        <Stack.Screen name="Usuarios" component={UsuariosScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
