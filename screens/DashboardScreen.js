import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const DashboardScreen = () => {
  const user = useSelector(state => state.auth.user);
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon
          name="settings-outline"
          size={30}
          onPress={() => navigation.navigate('Settings')}
          style={{ marginRight: 10 }}
        />
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Profile picture placeholder */}
      <Image
        source={{ uri: 'https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*' }} // Use an object with a uri property for remote images
        style={styles.profilePic}
      />
      {/* Greeting text */}
      <Text style={styles.greeting}>Hello {user ? user.first_name : "World"}!</Text>
      <Text>This is the Dashboard screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20, // Add padding for inner content
  },
  profilePic: {
    width: 80, // Set the width of the profile picture
    height: 80, // Set the height of the profile picture
    borderRadius: 40, // Circular profile picture
    position: 'absolute', // Position it absolutely
    top: 10, // Distance from the top
    left: 10, // Distance from the left
  },
  greeting: {
    marginTop: 100, // Add top margin to account for the absolute positioned profile picture
  },
});

export default DashboardScreen;
