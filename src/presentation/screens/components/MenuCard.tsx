import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface MenuCardProps {
  title: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}

export default function MenuCard({ title, iconName, onPress }: MenuCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <MaterialIcons name={iconName} size={50} color="#fff" />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 150,
    margin: 10,
  },
  text: {
    color: "#fff",
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
