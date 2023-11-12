import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { Provider, useDispatch, useSelector } from "react-redux";
import { CONFIG } from "./config";
import { PetProfileProvider } from "./contexts/PetProfileContext";
import BottomNavBar from "./navigation/BottomNavBar";
import { loadTokens } from "./redux/actions/auth";
import store from "./redux/store";
import LoginScreen from "./screens/Authentication/LoginScreen";
import ResetPasswordScreen from "./screens/Authentication/ResetPasswordScreen";
import SignUpScreen from "./screens/Authentication/SignUpScreen";
import Step0 from "./screens/PetProfileCreation/Step0";
import Step1 from "./screens/PetProfileCreation/Step1";
import Step2 from "./screens/PetProfileCreation/Step2";
import Step3 from "./screens/PetProfileCreation/Step3";
import Step4 from "./screens/PetProfileCreation/Step4";
import SettingsScreen from "./screens/SettingsScreen";
import SplashScreen from "./screens/SplashScreen";
import SecureStorage from "react-native-secure-storage";


enableScreens();
const Stack = createStackNavigator();

const MainApp = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const hasPets = useSelector(state => state.petProfile.hasPets);
  const isNewPetProfile = useSelector(state => state.petProfile.isNewPetProfile); // Use the new flag

  useEffect(() => {
    dispatch(loadTokens()); // Now this dispatch is correctly used within a component wrapped by Provider
  }, [dispatch]);

  let initialRouteName = "SignUp";
  if (isAuthenticated) {
    if (hasPets && !isNewPetProfile) {
      initialRouteName = "Feed";
    } else if (!hasPets || isNewPetProfile) {
      initialRouteName = "PetProfileCreationStep0";
    }
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? (
          hasPets ? (
            <Stack.Navigator>
              <Stack.Screen name="BottomNavBar" component={BottomNavBar} options={{ headerShown: false }} />
              <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
            </Stack.Navigator>
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
        <MainApp />
      </PetProfileProvider>
    </Provider>
  );
};

export default App;
