import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { Provider, useSelector } from "react-redux";
import { CONFIG } from "./config";
import { PetProfileProvider } from "./contexts/PetProfileContext";
import BottomNavBar from "./navigation/BottomNavBar";
import store from "./redux/store";
import LoginScreen from "./screens/Authentication/LoginScreen";
import ResetPasswordScreen from "./screens/Authentication/ResetPasswordScreen";
import SignUpScreen from "./screens/Authentication/SignUpScreen";
import Step0 from "./screens/PetProfileCreation/Step0";
import Step1 from "./screens/PetProfileCreation/Step1";
import Step2 from "./screens/PetProfileCreation/Step2";
import Step3 from "./screens/PetProfileCreation/Step3";
import Step4 from "./screens/PetProfileCreation/Step4";
import SplashScreen from "./screens/SplashScreen";


enableScreens();
const Stack = createStackNavigator();

const MainApp = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const hasPets = useSelector(state => state.petProfile.hasPets);
  const isNewPetProfile = useSelector(state => state.petProfile.isNewPetProfile); // Use the new flag
  const initialRouteName = isAuthenticated ? (hasPets && !isNewPetProfile ? "Feed" : "Dashboard") : "SignUp";

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? (
          hasPets ? (
            <BottomNavBar initialRouteName={initialRouteName} />
          ) : (
            <Stack.Navigator>
              {/* TODO: Enhance the step titles */}
              <Stack.Screen name="PetProfileCreationStep0" component={Step0}
                            options={{ title: "Pet Profile Creation" }} />
              <Stack.Screen name="PetProfileCreationStep1" component={Step1} options={{ title: "Step 1: Pet Name" }} />
              <Stack.Screen name="PetProfileCreationStep2" component={Step2}
                            options={{ title: "Step 2: Unique Pet Username" }} />
              <Stack.Screen name="PetProfileCreationStep3" component={Step3} options={{ title: "Step 3: Pet Type" }} />
              <Stack.Screen
                name="PetProfileCreationStep4"
                component={Step4}
                options={{
                  title: "Welcome",
                  headerLeft: null,
                  gestureEnabled: false,
                }}
              />

            </Stack.Navigator>
          )
        ) : (
          <Stack.Navigator initialRouteName="SignUp">
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: "Sign Up" }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Log In" }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: "Reset Password" }} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};


const App = () => {
  const [isSplash, setIsSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplash(false);
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);

  if (isSplash) {
    return <SplashScreen />;
  }

  return (
    <Provider store={store}>
      <PetProfileProvider>
        <MainApp />
      </PetProfileProvider>
    </Provider>
  );
};

export default App;
