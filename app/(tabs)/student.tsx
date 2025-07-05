import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

type StudentType = {
  name: string;
  email: string;
  registration: number;
  id: string;
};

export default function Student() {
  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const [email, setEmail] = useState("");
  const [savedStudent, setSavedStudent] = useState<StudentType | null>(null);

  useEffect(() => {
    loadStudentFromStorage();
  }, []);

  const loadStudentFromStorage = async () => {
    try {
      const studentData = await AsyncStorage.getItem("student");
      if (studentData) {
        const parsed: StudentType = JSON.parse(studentData);
        setSavedStudent(parsed);
      }
    } catch (error) {
      console.error("Erro ao carregar estudante do storage:", error);
    }
  };

  const handleSalvar = async () => {
    if (!name || !email || !registration) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    const student = {
      name,
      email,
      registration: Number(registration),
    };

    try {
      const response = await fetch("http://192.168.15.4:5202/api/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
      });

      if (!response.ok) {
        throw new Error(`Erro ao salvar: ${response.status}`);
      }

      const data: StudentType = await response.json();
      await AsyncStorage.setItem("student", JSON.stringify(data));
      setSavedStudent(data);
      Alert.alert("Sucesso", "Estudante salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar estudante:", error);
      Alert.alert("Erro", "Não foi possível salvar o estudante.");
    }
  };

  // Se já tiver um estudante salvo, mostrar os dados
  if (savedStudent) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Estudante salvo:</Text>
        <Text style={styles.info}>Nome: {savedStudent.name}</Text>
        <Text style={styles.info}>Matrícula: {savedStudent.registration}</Text>
        <Text style={styles.info}>Email: {savedStudent.email}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Matrícula:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a matrícula"
        value={registration}
        onChangeText={setRegistration}
        keyboardType="numeric"
      />

      <Text style={styles.label}>E-mail:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <View style={styles.buttonContainer}>
        <Button title="Salvar" onPress={handleSalvar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 6,
  },
});
