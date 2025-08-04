import { useUser } from "@/hooks/userProvider";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isUserLoading } = useUser();
  const [filter, setFilter] = useState("Todos");
  const filters = ["Todos", "Presente", "Em andamento", "Falta"];

  const apiBaseUrl = "http://192.168.15.7:5202/api";

  useEffect(() => {
    if (isUserLoading || !user?.id) return;

    async function fetchData() {
      try {
        const sessionsResponse = await axios.get(`${apiBaseUrl}/session`);
        const attendancesResponse = await axios.get(
          `${apiBaseUrl}/attendance/student/${user.id}`
        );

        setSessions(sessionsResponse.data);
        setAttendances(attendancesResponse.data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, isUserLoading]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  const attendedSessionIds = attendances.map((a) => a.sessionId);

  console.log(attendances);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric", // sem zero à esquerda
    month: "long",
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Olá, {user?.name}</Text>
          <Text style={styles.subtitle}>{today}</Text>
        </View>

        <TouchableOpacity
          style={styles.icon}
          onPress={() => router.push("/student")}
        >
          <FontAwesome5 name="user-graduate" size={32} color="black" />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", marginBottom: 16, gap: 8 }}>
        {filters.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setFilter(item)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: filter === item ? "#007BFF" : "#ccc",
              backgroundColor: filter === item ? "#007BFF" : "#fff",
            }}
          >
            <Text
              style={{
                color: filter === item ? "#fff" : "#333",
                fontWeight: "600",
                fontSize: 12,
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {sessions.length === 0 ? (
        <View style={styles.centered}>
          <Text>Nenhuma aula cadastrada</Text>
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          style={styles.listWrapper}
          data={sessions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .filter((item) => {
              const wasPresent = attendedSessionIds.includes(item.id);

              if (filter === "Todos") return true;
              if (filter === "Presente") return wasPresent;
              if (filter === "Em andamento")
                return item.status === 1 && !wasPresent;
              if (filter === "Falta") return item.status === 2 && !wasPresent;

              return true;
            })}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const status = item.status;
            const wasPresent = attendedSessionIds.includes(item.id);

            let backgroundColor = "#fff";
            let label = "";

            if (status === 1) {
              if (wasPresent) {
                label = "Presente";
                backgroundColor = "#C4F0C4"; // verde claro
              } else {
                label = "Em andamento";
                backgroundColor = "#FFEB99"; // amarelo
              }
            } else if (status === 2) {
              if (wasPresent) {
                label = "Presente";
                backgroundColor = "#C4F0C4"; // verde claro
              } else {
                label = "Falta";
                backgroundColor = "#FFC9C9"; // vermelho claro
              }
            } else {
              label = "Não iniciada";
              backgroundColor = "#fff";
            }

            const isInProgress = status === 1 && !wasPresent;

            return (
              <TouchableOpacity
                onPress={() => router.push("/explore")}
                disabled={!isInProgress}
              >
                <View style={[styles.item, { backgroundColor }]}>
                  <Text>ID da Sessão: {item.id}</Text>
                  <Text>
                    Data: {new Date(item.createdAt).toLocaleString("pt-BR")}
                  </Text>
                  <Text>{label}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
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
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  icon: {
    marginRight: 20,
    alignSelf: "center",
  },
  listWrapper: {
    flex: 1,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: "hidden",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  item: {
    padding: 15,
    borderRadius: 26,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
