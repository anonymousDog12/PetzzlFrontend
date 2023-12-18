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

  const rightToLeftInterpolator = ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    };
  };

  // Redirect logic based on user's pet profile status
  let initialRouteName = "SignUp";
  if (isAuthenticated) {
    if (!hasPets) {
      initialRouteName = "PetProfileCreationStep0";
    } else if (isNewPetProfile) {
      initialRouteName = "PetProfileCreationStep1";
    } else {
      initialRouteName = "Tabs";
    }
  }

  return (
    <RootStack.Navigator
      initialRouteName={initialRouteName}
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
        <>
          {/* For authenticated users with pets or when adding a new pet profile */}
          <RootStack.Screen
            name="Tabs"
            component={BottomNavBar}
            options={{ headerShown: false }}
          />
          <RootStack.Screen name="Settings" component={SettingsScreen} />
          <RootStack.Screen name="PostDetailScreen" component={PostDetailScreen}
                            options={{ headerShown: true, headerBackTitle: "Back" }} />
          <RootStack.Screen name="OtherUserDashboard" component={OtherUserDashboardScreen} />
          <RootStack.Screen name="OtherUserPostDetailScreen" component={OtherUserPostDetailScreen} />
          <RootStack.Screen name="LikerListScreen" component={LikerListScreen}
                            options={{ headerShown: true, headerBackTitle: "Back" }} />

          {!hasPets && (
            <RootStack.Screen name="PetProfileCreationStep0" component={Step0}
                              options={{ title: " ", cardStyleInterpolator: rightToLeftInterpolator }} />
          )}
          {isNewPetProfile && (
            <>
              <RootStack.Screen name="PetProfileCreationStep1" component={Step1}
                                options={{ title: "Step 1 of 3", cardStyleInterpolator: rightToLeftInterpolator }} />
              <RootStack.Screen name="PetProfileCreationStep2" component={Step2}
                                options={{ title: "Step 2 of 3", cardStyleInterpolator: rightToLeftInterpolator }} />
              <RootStack.Screen name="PetProfileCreationStep3" component={Step3}
                                options={{ title: "Step 3 of 3", cardStyleInterpolator: rightToLeftInterpolator }} />
              <RootStack.Screen name="PetProfileCreationStep4" component={Step4}
                                options={{ title: " ", cardStyleInterpolator: rightToLeftInterpolator }} />
            </>
          )}
        </>
      ) : (
        <>
          <RootStack.Screen name="SignUp" component={SignUpScreen} />
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
      <RootStack.Screen name="NewPostModal" component={NewPostModalNavigator} />
    </RootStack.Navigator>
  );
};

export default RootNavigator;
