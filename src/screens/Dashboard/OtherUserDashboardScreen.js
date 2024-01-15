import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Alert, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import SecureStorage from "react-native-secure-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { CONFIG } from "../../../config";
import EmptyDashboardPostList from "../../components/EmptyDashboardPostList";
import SliderModal from "../../components/SliderModal";
import { DEFAULT_PROFILE_PICS } from "../../data/AppContants";
import { fetchFeed } from "../../redux/actions/feed";
import { capitalizeFirstLetter } from "../../utils/common";
import styles from "./DashboardScreenStyles";


const OtherUserDashboardScreen = ({ route }) => {
  const { otherPetId } = route.params;
  const ownedPetIds = useSelector(state => state.petProfile.ownedPetIds);
  const isOwnedPet = !!ownedPetIds[otherPetId];
  const [otherPetProfile, setOtherPetProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [modalVisible, setModalVisible] = useState(false);

  useLayoutEffect(() => {
    if (!isOwnedPet) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color="black" style={{ marginRight: 10 }} />
          </TouchableOpacity>
        ),
      });
    } else {
      // If the pet is owned by the current user, do not display the ellipsis icon
      navigation.setOptions({ headerRight: () => null });
    }
  }, [navigation, isOwnedPet]);


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
      // Since the posts being fetched is local only
      // I am not moving this function to redux
      const accessToken = await SecureStorage.getItem("access");
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/pet_posts/${otherPetId}/`, {
        headers: {
          "Authorization": `JWT ${accessToken}`,
        },
      });
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

  useFocusEffect(
    React.useCallback(() => {
      fetchPostsForOtherPet();
    }, []),
  );


  const handleBlockUser = async () => {
    setModalVisible(false);
    Alert.alert(
      `Block ${otherPetId}?`,
      "Blocking will also hide all their associated pet profiles from you. They won't be notified, and neither you nor they will be able to see each other's posts.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Block User",
          onPress: () => performBlockUser(),
          style: "destructive",
        },
      ],
      { cancelable: false },
    );
  };

  const performBlockUser = async () => {
    setPosts([]);

    try {
      const accessToken = await SecureStorage.getItem("access");
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/userblocking/block/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `JWT ${accessToken}`,
        },
        body: JSON.stringify({ pet_id: otherPetId }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message, [{ text: "OK" }]);
        // The posts are already cleared optimistically, no need to refetch
        dispatch(fetchFeed());
      } else {
        // If the block failed, refetch the posts to ensure the UI is correct
        fetchPostsForOtherPet();
        Alert.alert("Error", data.error || "Failed to block user", [{ text: "OK" }]);
      }
    } catch (error) {
      // If there's an error, refetch the posts
      fetchPostsForOtherPet();
      Alert.alert("Error", "An error occurred while blocking the user. Please try again later.", [{ text: "OK" }]);
    }
    setModalVisible(false);
  };


  // Function to render each post
  const renderPost = ({ item }) => {

    if (isOwnedPet) {
      return (
        <TouchableOpacity
          style={styles.postItem}
          onPress={() => navigation.navigate("PostDetailScreen", {
            postId: item.post_id,
            petProfile: otherPetProfile,
          })}
        >
          <Image source={{ uri: item.thumbnail_url }} style={styles.postThumbnail} />
        </TouchableOpacity>
      );
    } else {
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
    }
  };


  const getProfilePic = (profilePic, petType) => {
    return profilePic || DEFAULT_PROFILE_PICS[petType] || DEFAULT_PROFILE_PICS["other"];
  };

  return (
    <View style={styles.container}>
      {otherPetProfile && (
        <View style={styles.petProfile}>
          <Image
            source={{ uri: getProfilePic(otherPetProfile.profile_pic_regular, otherPetProfile.pet_type) }}
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
        ListEmptyComponent={<EmptyDashboardPostList />}
      />
      <SliderModal
        dropdownVisible={modalVisible}
        setDropdownVisible={setModalVisible}
      >
        <TouchableOpacity onPress={handleBlockUser}>
          <Text style={styles.modalTextRed}>Block User</Text>
        </TouchableOpacity>
      </SliderModal>
    </View>
  );
};

export default OtherUserDashboardScreen;
