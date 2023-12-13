import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { Provider, useDispatch } from "react-redux";
import { PetProfileProvider } from "./contexts/PetProfileContext";
import RootNavigator from "./navigation/RootNavigator";
import { loadTokens } from "./redux/actions/auth";
import { setCurrentPetId } from "./redux/actions/petProfile";
import store from "./redux/store";
import SplashScreen from "./screens/SplashScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

enableScreens();
const Stack = createStackNavigator();

const AppInitializer = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      const storedPetId = await AsyncStorage.getItem('selectedPetId');
      if (storedPetId) {
        dispatch(setCurrentPetId(storedPetId));
      }
      setIsLoading(false);
    };

    initializeApp();
  }, [dispatch]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return <RootNavigator />;
};

const App = () => {
  const [isSplash, setIsSplash] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    store.dispatch(loadTokens())
      .then(() => {
        setIsAuthChecked(true);
      })
      .catch((error) => {
        console.error("Error during authentication check:", error);
      });

    const timer = setTimeout(() => {
      setIsSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isSplash || !isAuthChecked) {
    return <SplashScreen />;
  }

  return (
    <Provider store={store}>
      <PetProfileProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppInitializer />
          </NavigationContainer>
        </SafeAreaProvider>
      </PetProfileProvider>
    </Provider>
  );
};

export default App;
