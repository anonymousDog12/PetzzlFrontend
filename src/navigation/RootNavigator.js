import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { useSelector } from "react-redux";
import EmailLoginScreen from "../screens/Authentication/EmailLoginScreen";
import EmailResetPasswordScreen from "../screens/Authentication/EmailResetPasswordScreen";
import EmailSignUpScreen from "../screens/Authentication/EmailSignUpScreen";
import SignUpOptionsScreen from "../screens/Authentication/SignupOptions";
import BlockerListScreen from "../screens/BlockerListScreen";
import CommentScreen from "../screens/CommentScreen";
import OtherUserDashboardScreen from "../screens/Dashboard/OtherUserDashboardScreen";
import EditPetProfileScreen from "../screens/EditPetProfileScreen";
import LikerListScreen from "../screens/LikerListScreen";
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
  let initialRouteName = "SignUpOptions";
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
        headerTintColor: "#ffc02c",
        headerTitleStyle: {
          color: "#2a2a2c",
        },
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
          {!hasPets && (
            <RootStack.Screen name="PetProfileCreationStep0" component={Step0}
                              options={{
                                title: " ",
                                headerTransparent: true,
                                headerTintColor: "white",
                                headerTitleStyle: {
                                  color: "white",
                                },
                                cardStyleInterpolator: rightToLeftInterpolator,
                              }} />
          )}
          {isNewPetProfile && (
            <>
              <RootStack.Screen name="PetProfileCreationStep1" component={Step1}
                                options={{
                                  title: "Step 1 of 3",
                                  headerTintColor: "#ffc02c",
                                  headerTitleStyle: {
                                    color: "#ffc02c",
                                  },
                                  headerTransparent: true,
                                  cardStyleInterpolator: rightToLeftInterpolator,
                                }} />
              <RootStack.Screen name="PetProfileCreationStep2" component={Step2}
                                options={{
                                  title: "Step 2 of 3",
                                  headerTintColor: "#ffc02c",
                                  headerTitleStyle: {
                                    color: "#ffc02c",
                                  },
                                  headerTransparent: true,
                                  cardStyleInterpolator: rightToLeftInterpolator,
                                }} />
              <RootStack.Screen name="PetProfileCreationStep3" component={Step3}
                                options={{
                                  title: "Step 3 of 3",
                                  headerTintColor: "#ffc02c",
                                  headerTitleStyle: {
                                    color: "#ffc02c",
                                  },
                                  headerTransparent: true,
                                  cardStyleInterpolator: rightToLeftInterpolator,
                                }} />
              <RootStack.Screen name="PetProfileCreationStep4" component={Step4}
                                options={{
                                  title: " ",
                                  headerTransparent: true,
                                  headerTintColor: "white",
                                  headerLeft: () => null,
                                  gestureEnabled: false,
                                  cardStyleInterpolator: rightToLeftInterpolator,
                                }} />
            </>
          )}
          {hasPets && !isNewPetProfile && (
            <>
              <RootStack.Screen
                name="Tabs"
                children={() => <BottomNavBar initialRouteName={initialRouteName} />}
                options={{ headerShown: false }}
              />
              <RootStack.Screen name="EditPetProfile" component={EditPetProfileScreen}
                                options={{
                                  title: "Edit Profile",
                                  headerShown: true,
                                  headerBackTitle: "Back",
                                  cardStyleInterpolator: rightToLeftInterpolator,
                                }}
              />
              <RootStack.Screen name="Settings" component={SettingsScreen}
                                options={{
                                  headerShown: true,
                                  headerBackTitle: "Back",
                                  cardStyleInterpolator: rightToLeftInterpolator,
                                }} />
              <RootStack.Screen name="BlockerList" component={BlockerListScreen}
                                options={{
                                  title: "Blocked Accounts",
                                  headerShown: true,
                                  headerBackTitle: "Back",
                                  cardStyleInterpolator: rightToLeftInterpolator,
                                }}
              />
              <RootStack.Screen name="PostDetailScreen" component={PostDetailScreen}
                                options={{
                                  headerShown: true,
                                  headerBackTitle: "Back",
                                  title: "Detail",
                                  cardStyleInterpolator: rightToLeftInterpolator,
                                }} />
              <RootStack.Screen name="OtherUserDashboard"
                                component={OtherUserDashboardScreen}
                                options={{
                                  title: "Dashboard",
                                  headerShown: true,
                                  headerBackTitle: "Back",
                                  cardStyleInterpolator: rightToLeftInterpolator,
                                }} />
              <RootStack.Screen name="OtherUserPostDetailScreen"
                                component={OtherUserPostDetailScreen}
                                options={{
                                  title: "Detail",
                                  headerShown: true,
                                  headerBackTitle: "Back",
                                  cardStyleInterpolator: rightToLeftInterpolator,
                                }} />
              <RootStack.Screen name="LikerListScreen"
                                component={LikerListScreen}
                                options={{
                                  headerShown: true,
                                  headerBackTitle: "Back",
                                  title: "Likes",
                                  cardStyleInterpolator: rightToLeftInterpolator,
                                }} />
              <RootStack.Screen name="CommentScreen"
                                component={CommentScreen}
                                options={{
                                  headerShown: true,
                                  headerBackTitle: "Back",
                                  title: "Comments",
                                  cardStyleInterpolator: rightToLeftInterpolator, // TODO: try making it slide from bottom
                                }} />
            </>
          )}
        </>
      ) : (
        <>
          <RootStack.Screen
            name="SignUpOptions"
            component={SignUpOptionsScreen}
            options={{
              title: "",
              headerTransparent: true,
            }}
          />

          <RootStack.Screen
            name="SignUp"
            component={EmailSignUpScreen}
            options={{
              title: "",
              headerTransparent: true,
              cardStyleInterpolator: rightToLeftInterpolator,
            }}
          />
          <RootStack.Screen
            name="Login"
            component={EmailLoginScreen}
            options={{
              title: "",
              headerTransparent: true,
              cardStyleInterpolator: rightToLeftInterpolator,
            }}
          />
          <RootStack.Screen
            name="ResetPassword"
            component={EmailResetPasswordScreen}
            options={{
              title: "",
              headerTransparent: true,
              cardStyleInterpolator: rightToLeftInterpolator,
            }}
          />
        </>
      )}
      <RootStack.Screen name="NewPostModal" component={NewPostModalNavigator} options={{ headerShown: false }} />
    </RootStack.Navigator>
  );
};

export default RootNavigator;
