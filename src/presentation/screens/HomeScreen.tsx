import React from "react";
import { View, StyleSheet } from "react-native";
import MenuCard from "./components/MenuCard";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App/navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
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
