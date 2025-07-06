import { useUser } from "@/hooks/userProvider";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isUserLoading } = useUser();

  const studentId = "9541ce3d-494d-4e6f-81fe-3ff4b05a43e4"; // Substitua por um ID real
  const apiBaseUrl = ""; // Substitua pelo IP local da sua máquina

  useEffect(() => {
    if (isUserLoading || !user?.id) return;

    async function fetchAttendances() {
      try {
        const response = await axios.get(
          `http://192.168.15.4:5202/api/attendance/student/${user?.id}`
        );
        setAttendances(response.data);
      } catch (error) {
        console.error("Erro ao buscar presenças:", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAttendances();
  }, [user, isUserLoading]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Presenças do Estudante</Text>
      <FlatList
        data={attendances}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>ID da Sessão: {item.sessionId}</Text>
            <Text>Data: {new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  item: {
    padding: 15,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
