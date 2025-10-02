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

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Clientes" component={ClientesScreen} />
        <Stack.Screen name="Usuarios" component={UsuariosScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
