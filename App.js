import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { CONFIG } from "./config";
import SignUpScreen from './screens/Authentication/SignUpScreen';
import LoginScreen from './screens/Authentication/LoginScreen';
import ResetPasswordScreen from "./screens/Authentication/ResetPasswordScreen";
import Step0 from "./screens/PetProfileCreation/Step0";
import Step1 from "./screens/PetProfileCreation/Step1";
import Step2 from "./screens/PetProfileCreation/Step2";
import Step3 from "./screens/PetProfileCreation/Step3";
import Step4 from "./screens/PetProfileCreation/Step4";
import SplashScreen from './screens/SplashScreen';
import HomeScreen from "./screens/HomeScreen";
import { Provider, useSelector } from "react-redux";
import { PetProfileProvider } from "./contexts/PetProfileContext";
import store from './redux/store';
import axios from 'axios';

enableScreens();
const Stack = createStackNavigator();

const MainApp = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);

  const [hasPets, setHasPets] = useState(false); // State to track if user has pets

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(`User is authenticated with ID: ${user.id}`);

      // Fetch user's pets from the API
      axios.get(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/user/${user.id}/`)
        .then(response => {
          // Here you might want to check the response more carefully
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            setHasPets(true);
            console.log('User has pets');
          } else {
            setHasPets(false);
            console.log('User has no pets');
          }
        })
        .catch(error => {
          console.error('An error occurred:', error);
        });

    } else {
      console.log("User isn't authenticated");
    }
  }, [isAuthenticated, user]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? (
          hasPets ? (
            <HomeScreen />
          ) : (
            <Stack.Navigator>
              {/* TODO: Enhance the step titles */}
              <Stack.Screen name="PetProfileCreationStep0" component={Step0} options={{ title: 'Pet Profile Creation' }} />
              <Stack.Screen name="PetProfileCreationStep1" component={Step1} options={{ title: 'Step 1: Pet Name' }} />
              <Stack.Screen name="PetProfileCreationStep2" component={Step2} options={{ title: 'Step 2: Unique Pet Username' }} />
              <Stack.Screen name="PetProfileCreationStep3" component={Step3} options={{ title: 'Step 3: Pet Type' }} />
              <Stack.Screen
                name="PetProfileCreationStep4"
                component={Step4}
                options={{
                  title: 'Welcome',
                  headerLeft: null,
                  gestureEnabled: false
                }}
              />


            </Stack.Navigator>
          )
        ) : (
          <Stack.Navigator initialRouteName="SignUp">
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Sign Up' }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log In' }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
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
}

export default App;
