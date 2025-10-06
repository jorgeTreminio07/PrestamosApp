import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, StyleSheet, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Cliente from "../../../../domain/models/Cliente";
import Prestamo, { Moneda, Tiempo } from "../../../../domain/models/Prestamo";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (prestamo: Prestamo) => void;
  clientes: Cliente[];
  prestamoToEdit?: Prestamo;
}

export default function PrestamoModal({
  visible,
  onClose,
  onSave,
  clientes,
  prestamoToEdit,
}: Props) {
  const [clienteId, setClienteId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [moneda, setMoneda] = useState<Moneda>("$");
  const [interes, setInteres] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [tiempo, setTiempo] = useState<Tiempo>("Días");

  const [errores, setErrores] = useState({
    clienteId: false,
    cantidad: false,
    interes: false,
    periodo: false,
    periodoDias: false,
  });

  useEffect(() => {
    if (visible) {
      if (prestamoToEdit) {
        setClienteId(prestamoToEdit.clienteId);
        setCantidad(prestamoToEdit.cantidad.toString());
        setMoneda(prestamoToEdit.moneda);
        setInteres(prestamoToEdit.interes.toString());
        setPeriodo(prestamoToEdit.periodo.toString());
        setTiempo(prestamoToEdit.tiempo);
      } else {
        setClienteId("");
        setCantidad("");
        setMoneda("$");
        setInteres("");
        setPeriodo("");
        setTiempo("Días");
      }

      setErrores({
        clienteId: false,
        cantidad: false,
        interes: false,
        periodo: false,
        periodoDias: false,
      });
    }
  }, [visible, prestamoToEdit]);

  const handleSave = () => {
    const nuevosErrores = {
      clienteId: clienteId === "",
      cantidad: isNaN(parseFloat(cantidad)) || parseFloat(cantidad) <= 0,
      interes: isNaN(parseFloat(interes)) || parseFloat(interes) < 0,
      periodo: isNaN(parseInt(periodo)) || parseInt(periodo) <= 0,
      periodoDias: tiempo === "Días" && parseInt(periodo) > 25,
    };

    setErrores(nuevosErrores);

    const tieneErrores = Object.values(nuevosErrores).some((e) => e);
    if (tieneErrores) return;

    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) return;

    const fechaActual = new Date().toISOString().split("T")[0];

    const prestamo: Prestamo = {
      id: prestamoToEdit?.id ?? "",
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      cantidad: parseFloat(cantidad),
      moneda,
      interes: parseFloat(interes),
      datePrestamo: prestamoToEdit?.datePrestamo ?? fechaActual,
      periodo: parseInt(periodo),
      tiempo,
      totalPagar: prestamoToEdit?.totalPagar ?? 0,
      deudaStatus: prestamoToEdit?.deudaStatus ?? true,
      fechaVencimiento: prestamoToEdit?.fechaVencimiento ?? "",
      montoPagado: prestamoToEdit?.montoPagado ?? 0,
      demoraDias: prestamoToEdit?.demoraDias ?? 0,
    };

    // console.log("click guaurdar", prestamo);
    onSave(prestamo);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {prestamoToEdit ? "Editar Préstamo" : "Agregar Nuevo Préstamo"}
          </Text>

          {/* Cliente */}
          <Text style={styles.label}>Cliente</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={clienteId}
              onValueChange={(itemValue: string) => setClienteId(itemValue)}
              enabled={!prestamoToEdit} // No editable si es edición
            >
              <Picker.Item label="Seleccione un cliente..." value="" />
              {clientes.map((cliente) => (
                <Picker.Item
                  key={cliente.id}
                  label={cliente.nombre}
                  value={cliente.id}
                />
              ))}
            </Picker>
          </View>
          {errores.clienteId && (
            <Text style={styles.errorText}>Seleccione un cliente válido</Text>
          )}

          {/* Cantidad */}
          <Text style={styles.label}>Cantidad Prestada</Text>
          <TextInput
            keyboardType="numeric"
            value={cantidad}
            onChangeText={setCantidad}
            style={[styles.input, errores.cantidad && styles.inputError]}
          />
          {errores.cantidad && (
            <Text style={styles.errorText}>Ingrese una cantidad válida</Text>
          )}

          {/* Moneda */}
          <Text style={styles.label}>Moneda</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={moneda}
              onValueChange={(itemValue: Moneda) =>
                setMoneda(itemValue as Moneda)
              }
            >
              <Picker.Item label="$ Dolar" value="$" />
              <Picker.Item label="C$ Cordoba" value="C$" />
            </Picker>
          </View>

          {/* Interés */}
          <Text style={styles.label}>Interés (%)</Text>
          <TextInput
            keyboardType="numeric"
            value={interes}
            onChangeText={setInteres}
            style={[styles.input, errores.interes && styles.inputError]}
          />
          {errores.interes && (
            <Text style={styles.errorText}>Ingrese un interés válido</Text>
          )}

          {/* Periodo */}
          <Text style={styles.label}>Periodo</Text>
          <TextInput
            keyboardType="numeric"
            value={periodo}
            onChangeText={setPeriodo}
            style={[styles.input, errores.periodo && styles.inputError]}
          />
          {errores.periodo && (
            <Text style={styles.errorText}>Ingrese un periodo válido</Text>
          )}
          {errores.periodoDias && (
            <Text style={styles.errorText}>
              Si el tiempo es "Días", el periodo debe ser menor a 26
            </Text>
          )}

          {/* Tiempo */}
          <Text style={styles.label}>Tiempo</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tiempo}
              onValueChange={(itemValue: Tiempo) =>
                setTiempo(itemValue as Tiempo)
              }
            >
              <Picker.Item label="Días" value="Días" />
              {/* <Picker.Item label="Semanas" value="Semanas" /> */}
              <Picker.Item label="Meses" value="Meses" />
            </Picker>
          </View>

          {/* Botones */}
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
  label: {
    fontWeight: "600",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 5,
    overflow: "hidden",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});
