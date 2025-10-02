import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Modal } from "react-native";
import Cliente from "../../../domain/models/Cliente";
import uuid from "react-native-uuid";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (cliente: Cliente) => void;
  clienteToEdit?: Cliente;
}

export default function ClienteModal({
  visible,
  onClose,
  onSave,
  clienteToEdit,
}: Props) {
  const [nombre, setNombre] = useState(clienteToEdit?.nombre || "");
  const [cedula, setCedula] = useState(clienteToEdit?.cedula || "");
  const [direccion, setDireccion] = useState(clienteToEdit?.direccion || "");
  const [numeroTelefono, setNumeroTelefono] = useState(
    clienteToEdit?.numeroTelefono || ""
  );

  const handleSave = () => {
    if (!nombre || !cedula || !direccion || !numeroTelefono) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const cliente = clienteToEdit
      ? { ...clienteToEdit, nombre, cedula, direccion, numeroTelefono }
      : new Cliente(
          uuid.v4().toString(),
          nombre,
          cedula,
          direccion,
          numeroTelefono
        );

    onSave(cliente);
    setNombre("");
    setCedula("");
    setDireccion("");
    setNumeroTelefono("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {clienteToEdit ? "Editar Cliente" : "Crear Cliente"}
          </Text>
          <TextInput
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
          />
          <TextInput
            placeholder="Cédula"
            value={cedula}
            onChangeText={setCedula}
            style={styles.input}
          />
          <TextInput
            placeholder="Dirección"
            value={direccion}
            onChangeText={setDireccion}
            style={styles.input}
          />
          <TextInput
            placeholder="Teléfono"
            value={numeroTelefono}
            onChangeText={setNumeroTelefono}
            style={styles.input}
            keyboardType="phone-pad"
          />
          <View style={styles.buttons}>
            <Button title="Cancelar" onPress={onClose} color="#888" />
            <Button title="Guardar" onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    padding: 8,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});
