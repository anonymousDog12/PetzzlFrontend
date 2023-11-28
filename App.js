import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { Provider } from "react-redux";
import { PetProfileProvider } from "./contexts/PetProfileContext";
import RootNavigator from "./navigation/RootNavigator";
import { loadTokens } from "./redux/actions/auth";
import store from "./redux/store";
import SplashScreen from "./screens/SplashScreen";


enableScreens();
const Stack = createStackNavigator();


const App = () => {
  const [isSplash, setIsSplash] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    // Load tokens and check authentication state
    store.dispatch(loadTokens())
      .then(() => {
        console.log("Authentication check complete"); // Debugging log
        setIsAuthChecked(true); // Set state to true once auth check is complete
      })
      .catch((error) => {
        console.error("Error during authentication check:", error); // Error handling
      });

    // Set a timer for the splash screen
    const timer = setTimeout(() => {
      console.log("Splash screen timer complete"); // Debugging log
      setIsSplash(false);
    }, 2000); // 2 seconds delay

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
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </PetProfileProvider>
    </Provider>
  );
};

export default App;
