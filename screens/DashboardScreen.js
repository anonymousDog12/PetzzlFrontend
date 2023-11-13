import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CONFIG } from '../config'; // Adjust the path to your CONFIG file
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal } from 'react-native'; // Import Modal and TouchableOpacity

const DashboardScreen = () => {
  const user = useSelector(state => state.auth.user);
  const navigation = useNavigation();
  const [petProfiles, setPetProfiles] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedPetName, setSelectedPetName] = useState('Menu');

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
      headerLeft: () => (
        <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
          <Text style={styles.dropdownButton}>{selectedPetName}</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <Icon
          name="settings-outline"
          size={30}
          onPress={() => navigation.navigate('Settings')}
          style={{ marginRight: 10 }}
        />
      ),
    });
  }, [navigation, dropdownVisible, selectedPetName]);

  return (
    <View style={styles.container}>

      <Modal
        animationType="slide"
        transparent={true}
        visible={dropdownVisible}
        onRequestClose={() => {
          setDropdownVisible(!dropdownVisible);
        }}
      >
        <View style={styles.dropdownContainer}>
          {petProfiles.map((pet, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedPetName(pet.pet_name); // Update the selected pet's name
                setDropdownVisible(false);
              }}
            >
              <Text>{pet.pet_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

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
  dropdownButton: {
    marginLeft: 10,
    fontSize: 18,
    color: 'blue',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 50, // Adjust this value as needed
    left: 10,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    padding: 10,
  },
});

export default DashboardScreen;
