import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import DashboardScreen from "../screens/DashboardScreen";
import FeedScreen from "../screens/FeedScreen";
import NewPostNavigator from "./NewPostNavigator"; // Imported NewPostNavigator

const Tab = createBottomTabNavigator();


const BottomNavBar = ({ initialRouteName }) => {
  const navigation = useNavigation();

  const resetNewPostStack = () => {
    navigation.navigate("NewPost", {
      screen: "SelectPhoto",
    });
  };


  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={({ route }) => ({
        tabBarOnPress: (e) => {
          // Intercept tab press for NewPost
          if (route.name === "NewPost") {
            e.preventDefault();
            resetNewPostStack();
          } else {
            e.defaultHandler();
          }
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="NewPost" component={NewPostNavigator} listeners={{ tabPress: resetNewPostStack }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
    </Tab.Navigator>
  );
};

export default BottomNavBar;
