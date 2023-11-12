import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useSelector, useDispatch } from 'react-redux'; // Import useDispatch
import { logout } from '../redux/actions/auth'; // Adjust the path as needed

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  // Function to handle log out
  const handleLogout = () => {
    console.log('logging out');
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <Text>Settings</Text>
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default SettingsScreen;
