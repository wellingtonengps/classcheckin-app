import { Alert, Button, StyleSheet, Text, View } from "react-native";

import axios from "axios";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";

export default function TabTwoScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState([]);

  const studentId = "1141ce3d-494d-4e6f-81fe-3ff4b05a43e4"; // Substitua pelo valor real ou torne dinâmico

  const fetchData = async (sessionId: string) => {
    try {
      /*
      const response = await fetch("http://localhost:5202/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: "9541ce3d-494d-4e6f-81fe-3ff4b05a43e4",
          sessionId: "a5aa4cc3-3280-4eae-aa4d-cd095c33f17c",
        }),
      });*/

      const { data } = await axios.post(
        "http://192.168.15.4:5202/api/attendance",
        {
          studentId: studentId,
          sessionId: sessionId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data) {
        Alert.alert("Presença registrada com sucesso!");
      } else {
        const errorText = await data.text();
        Alert.alert("Erro ao registrar presença", errorText);
      }
    } catch (error: any) {
      Alert.alert("Erro de conexão", error.nessage);
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();

      if (status !== "granted") {
        alert(
          "Desculpe, precisamos da permisão da câmera para fazer isso funcionar!"
        );
      }
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: Prop) => {
    setScanned(true);

    Alert.alert(
      `Código ${type} Scaneado`,
      `Dados: ${data}`,
      [
        {
          text: "OK",
          onPress: () => setScanned(false),
        },
      ],
      { cancelable: false }
    );

    fetchData(data);
  };

  if (!permission?.granted) {
    // Camera permissions are still loading or denied.
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Permissão da câmera não concedida.
        </Text>
        <Button title="Solicitar Permissão" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <CameraView
      style={styles.camera}
      onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
    >
      <View style={styles.layerContainer}>
        <View style={styles.layerTop} />
        <View style={styles.layerCenter}>
          <View style={styles.layerLeft} />
          <View style={styles.focused} />
          <View style={styles.layerRight} />
        </View>
        <View style={styles.layerBottom} />
      </View>
    </CameraView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  permissionText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
  },
  layerContainer: {
    flex: 1,
  },
  layerTop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  layerCenter: {
    flexDirection: "row",
  },
  layerLeft: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  focused: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: "#00FF00",
  },
  layerRight: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  layerBottom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  resultContainer: {
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  resultText: {
    fontSize: 18,
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#00FF00",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
