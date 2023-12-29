import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import FeedScreen from "../screens/FeedScreen";


const Tab = createBottomTabNavigator();

const EmptyScreen = () => null;

const screenHeight = Dimensions.get('window').height;
const tabBarHeight = screenHeight * 0.1;

const TabBarIconLabel = ({ focused, color, iconName, label }) => {
  return (
    <View style={{ alignItems: 'center' }}>
      <Ionicons name={iconName} size={23} color={color} />
      <View style={{ height: 4 }} />
      <Text style={{ color, fontSize: 10 }}>{label}</Text>
    </View>
  );
};
const BottomNavBar = ({ initialRouteName }) => {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName, label;

          if (route.name === "Feed") {
            iconName = focused ? "home" : "home-outline";
            label = 'Feed';
          } else if (route.name === "NewPost") {
            iconName = focused ? "add-circle" : "add-circle-outline";
            label = 'New Post';
          } else if (route.name === "Dashboard") {
            iconName = focused ? "paw" : "paw-outline";
            label = 'Dashboard';
          }

          return <TabBarIconLabel focused={focused} color={color} iconName={iconName} label={label} />;
        },
        tabBarLabel: () => null,  // Disable the default label rendering
        tabBarActiveTintColor: "#ffc02c",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: [
          {
            display: "flex",
            height: tabBarHeight,
            paddingBottom: tabBarHeight * 0.18,
          },
          null,
        ],
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="NewPost" component={EmptyScreen} listeners={{ tabPress: (e) => { e.preventDefault(); navigation.navigate("NewPostModal"); }}} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
    </Tab.Navigator>
  );
};

export default BottomNavBar;
