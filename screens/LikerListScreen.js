import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from "react-native";
import SecureStorage from "react-native-secure-storage";
import { CONFIG } from "../config";

const LikerListScreen = ({ route }) => {
  const { postId } = route.params;
  const navigation = useNavigation();
  const currentPetId = useSelector(state => state.petProfile.currentPetId);
  const [likers, setLikers] = useState([]);


  useEffect(() => {
    const fetchLikers = async () => {
      try {
        const accessToken = await SecureStorage.getItem("access");
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/likers/`, {
          headers: {
            "Authorization": `JWT ${accessToken}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setLikers(data.likers);
        } else {
          console.error('Error fetching likers:', data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchLikers();
  }, [postId]);

  const navigateToDashboard = (selectedPetId) => {
    if (selectedPetId === currentPetId) {
      navigation.navigate('Dashboard');
    } else {
      navigation.navigate('OtherUserDashboard', { otherPetId: selectedPetId });
    }
  };


  const renderLiker = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.likerContainer}
        onPress={() => navigateToDashboard(item.pet_profile__pet_id)}
      >
        <Image
          source={{ uri: item.pet_profile__profile_pic_thumbnail_small }}
          style={styles.profilePic}
        />
        <Text style={styles.likerName}>{item.pet_profile__pet_id}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={likers}
        renderItem={renderLiker}
        keyExtractor={item => item.pet_id ? item.pet_id.toString() : Math.random().toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  likerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  likerName: {
    fontSize: 16,
  },
});

export default LikerListScreen;
