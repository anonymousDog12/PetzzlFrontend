import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const DashboardScreen = () => {
  const user = useSelector(state => state.auth.user);
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon name="pizza-outline" size={30} color="#900" solid />
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text>Hello {user ? user.first_name : "World"}!</Text>
      <Text>This is the Dashboard screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardScreen;
