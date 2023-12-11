import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { useSelector } from "react-redux";
import LoginScreen from "../screens/Authentication/LoginScreen";
import ResetPasswordScreen from "../screens/Authentication/ResetPasswordScreen";
import SignUpScreen from "../screens/Authentication/SignUpScreen";
import LikerListScreen from "../screens/LikerListScreen";
import OtherUserDashboardScreen from "../screens/OtherUserDashboardScreen";
import OtherUserPostDetailScreen from "../screens/OtherUserPostDetailScreen";
import Step0 from "../screens/PetProfileCreation/Step0";
import Step1 from "../screens/PetProfileCreation/Step1";
import Step2 from "../screens/PetProfileCreation/Step2";
import Step3 from "../screens/PetProfileCreation/Step3";
import Step4 from "../screens/PetProfileCreation/Step4";
import PostDetailScreen from "../screens/PostDetailScreen";
import SettingsScreen from "../screens/SettingsScreen";
import BottomNavBar from "./BottomNavBar";
import NewPostModalNavigator from "./NewPostModalNavigator";


const RootStack = createStackNavigator();

const RootNavigator = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const hasPets = useSelector(state => state.petProfile.hasPets);
  const isNewPetProfile = useSelector(state => state.petProfile.isNewPetProfile);

  return (
    <RootStack.Navigator
      screenOptions={{
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      {isAuthenticated ? (
        hasPets && !isNewPetProfile ? (
          <>
            <RootStack.Screen name="Tabs" component={BottomNavBar} />
            <RootStack.Screen name="Settings" component={SettingsScreen} />
            <RootStack.Screen
              name="PostDetailScreen"
              component={PostDetailScreen}
              options={{
                headerShown: true,
                headerBackTitle: "Back",
              }}
            />
            <RootStack.Screen name="OtherUserDashboard" component={OtherUserDashboardScreen} />
            <RootStack.Screen name="OtherUserPostDetailScreen" component={OtherUserPostDetailScreen} />
            <RootStack.Screen
              name="LikerListScreen"
              component={LikerListScreen}
              options={{
                headerShown: true,
                headerBackTitle: "Back",
              }}
            />
          </>
        ) : (
          <>
            <RootStack.Screen name="PetProfileCreationStep0" component={Step0} />
            <RootStack.Screen name="PetProfileCreationStep1" component={Step1} />
            <RootStack.Screen name="PetProfileCreationStep2" component={Step2} />
            <RootStack.Screen name="PetProfileCreationStep3" component={Step3} />
            <RootStack.Screen name="PetProfileCreationStep4" component={Step4} />
            {/* Additional screens for authenticated users without pets */}
          </>
        )
      ) : (
        <>
          <RootStack.Screen name="SignUp" component={SignUpScreen} />
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          {/* Additional screens for unauthenticated users */}
        </>
      )}
      <RootStack.Screen name="NewPostModal" component={NewPostModalNavigator} />
      {/* Additional modals or screens that should be available regardless of authentication status */}
    </RootStack.Navigator>
  );
};

export default RootNavigator;
