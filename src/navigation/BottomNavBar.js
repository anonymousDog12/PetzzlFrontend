import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import DashboardScreen from "../screens/DashboardScreen";
import FeedScreen from "../screens/FeedScreen";


const Tab = createBottomTabNavigator();

const EmptyScreen = () => null;

const BottomNavBar = ({ initialRouteName }) => {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Feed") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "NewPost") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Dashboard") {
            iconName = focused ? "paw" : "paw-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#ffc02c",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: [
          {
            display: "flex",
          },
          null,
        ],
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen
        name="NewPost"
        component={EmptyScreen}
        options={{
          tabBarLabel: "New Post",
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("NewPostModal");
          },
        }}
      />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
    </Tab.Navigator>
  );
};

export default BottomNavBar;
