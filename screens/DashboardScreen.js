import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native'; // Import FlatList for rendering the list
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CONFIG } from '../config'; // Adjust the path to your CONFIG file

const DashboardScreen = () => {
  const user = useSelector(state => state.auth.user);
  const navigation = useNavigation();
  const [petProfiles, setPetProfiles] = useState([]);

  useEffect(() => {
    // Function to fetch pet profiles
    const fetchPetProfiles = async () => {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/user/${user.id}/`);
        const data = await response.json();
        setPetProfiles(data);
      } catch (error) {
        console.error('Failed to fetch pet profiles', error);
      }
    };

    if (user) {
      fetchPetProfiles();
    }
  }, [user]);

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
      <FlatList
        data={petProfiles}
        keyExtractor={item => item.pet_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.petProfile}>
            <Text>Pet Name: {item.pet_name}</Text>
            <Text>Pet Type: {item.pet_type}</Text>
            {/* Add more details as needed */}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  petProfile: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: 'lightgrey',
    borderRadius: 5,
  },
});

export default DashboardScreen;
