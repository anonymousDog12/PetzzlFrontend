import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { CONFIG } from "../../../config";
import { DEFAULT_PROFILE_PICS } from "../../data/FieldNames";
import { capitalizeFirstLetter } from "../../utils/common";
import styles from "./DashboardScreenStyles";


const OtherUserDashboardScreen = ({ route }) => {
  const { otherPetId } = route.params;
  const [otherPetProfile, setOtherPetProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();

  // Function to fetch other pet's profile
  const fetchOtherPetProfile = async () => {
    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/petprofiles/pet_profiles/${otherPetId}/`);
      const data = await response.json();
      setOtherPetProfile(data);
    } catch (error) {
      console.error("Failed to fetch other pet profile", error);
    }
  };

  // Function to fetch posts associated with other pet
  const fetchPostsForOtherPet = async () => {
    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/pet_posts/${otherPetId}/`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts for other pet", error);
    }
  };

  useEffect(() => {
    fetchOtherPetProfile();
    fetchPostsForOtherPet();
  }, [otherPetId]);

  // Function to render each post
  const renderPost = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.postItem}
        onPress={() => navigation.navigate("OtherUserPostDetailScreen", {
          postId: item.post_id,
          petId: otherPetProfile.pet_id,
          petName: otherPetProfile.pet_name,
          // TODO: refactor the get profile pic into a common variable
          petProfilePic: getProfilePic(otherPetProfile.profile_pic_thumbnail_small, otherPetProfile.pet_type),
        })}
      >
        <Image source={{ uri: item.thumbnail_url }} style={styles.postThumbnail} />
      </TouchableOpacity>
    );
  };


  const getProfilePic = (profilePic, petType) => {
    return profilePic || DEFAULT_PROFILE_PICS[petType] || DEFAULT_PROFILE_PICS["other"];
  };

  return (
    <View style={styles.container}>
      {otherPetProfile && (
        <View style={styles.petProfile}>
          <Image
            source={{ uri: getProfilePic(otherPetProfile.profile_pic_thumbnail_small, otherPetProfile.pet_type) }}
            style={styles.profilePic}
          />
          <View style={styles.petInfo}>
            <Text style={styles.petId}>@{otherPetProfile.pet_id}</Text>
            <Text style={styles.petName}>{otherPetProfile.pet_name}</Text>
            <Text style={styles.petType}>{capitalizeFirstLetter(otherPetProfile.pet_type)}</Text>
          </View>
        </View>
      )}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.post_id.toString()}
        numColumns={3}
      />
    </View>
  );
};

export default OtherUserDashboardScreen;
