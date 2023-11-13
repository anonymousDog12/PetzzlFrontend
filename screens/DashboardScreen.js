import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CONFIG } from '../config';
import { Image } from 'react-native';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal } from 'react-native';
import { DEFAULT_PROFILE_PICS, PET_TYPES } from "../data/FieldNames"; // Import Modal and TouchableOpacity

const DashboardScreen = () => {
  const user = useSelector(state => state.auth.user);
  const navigation = useNavigation();
  const [petProfiles, setPetProfiles] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedPetName, setSelectedPetName] = useState('Switch Profile');
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [currentPetProfile, setCurrentPetProfile] = useState(null);

  const getProfilePicUrl = (profilePicUrl, petType) => {
    console.log(petType)
    return profilePicUrl || DEFAULT_PROFILE_PICS[petType] || DEFAULT_PROFILE_PICS[PET_TYPES.OTHER];
  };



  const fetchPetProfile = async (petId) => {
    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/${petId}/`);
      const data = await response.json();
      setCurrentPetProfile(data);
    } catch (error) {
      console.error('Failed to fetch individual pet profile', error);
    }
  };

  useEffect(() => {
    const fetchPetProfiles = async () => {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/user/${user.id}/`);
        const data = await response.json();
        setPetProfiles(data);
        if (data.length > 0) {
          const defaultPetId = data[0].pet_id;
          setSelectedPetName(data[0].pet_name);
          setSelectedPetId(defaultPetId); // Set the default selected pet's id
          fetchPetProfile(defaultPetId); // Fetch the default pet's profile
        } else {
          setSelectedPetName('Select Pet');
          setSelectedPetId(null);
          setCurrentPetProfile(null);
        }
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
                setSelectedPetName(pet.pet_name);
                setSelectedPetId(pet.pet_id);
                fetchPetProfile(pet.pet_id); // Fetch the individual pet profile
                console.log(`Selected pet ID: ${pet.pet_id}`);
                setDropdownVisible(false);
              }}
            >
              <Text>{pet.pet_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {currentPetProfile && (
        <FlatList
          data={[currentPetProfile]} // Display the current pet profile
          keyExtractor={item => item.pet_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.petProfile}>
              <Image
                source={{ uri: getProfilePicUrl(item.profile_pic_thumbnail_small, item.pet_type) }} // Pass in pet_type to the function
                style={styles.profilePic}
              />
              <Text>Pet Name: {item.pet_name}</Text>
              <Text>Pet Type: {item.pet_type}</Text>
              {/* Add more details as needed */}
            </View>
          )}
        />
      )}
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
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 10,
  },
});

export default DashboardScreen;