import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import SignUpScreen from './screens/Authentication/SignUpScreen';
import LoginScreen from './screens/Authentication/LoginScreen';
import ResetPasswordScreen from "./screens/Authentication/ResetPasswordScreen";
import SplashScreen from './screens/SplashScreen';
import HomeScreen from "./screens/HomeScreen";
import { Provider, useSelector } from "react-redux";
import store from './redux/store';

enableScreens();
const Stack = createStackNavigator();

const MainApp = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? (
          <HomeScreen />
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
      <MainApp />
    </Provider>
  );
}

export default App;
