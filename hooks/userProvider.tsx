import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type UserType = {
  name: string;
  email: string;
  registration: number;
  id: string;
};

type UserContextType = {
  user: UserType | null;
  isUserLoading: boolean;
  setUser: (user: UserType | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserType | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const data = await AsyncStorage.getItem("user");
        if (data) {
          const parsedUser: UserType = JSON.parse(data);
          setUserState(parsedUser);
        }
      } catch (e) {
        console.log("Erro ao carregar usuário do AsyncStorage", e);
      } finally {
        setIsUserLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const setUser = async (user: UserType | null) => {
    try {
      if (user) {
        await AsyncStorage.setItem("user", JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem("user");
      }
      setUserState(user);
    } catch (e) {
      console.log("Erro ao salvar usuário no AsyncStorage", e);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de UserProvider");
  }
  return context;
};
