import React, { useEffect, useState } from "react";
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import SecureStorage from "react-native-secure-storage";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { CONFIG } from "../config";


const { width } = Dimensions.get("window");
const imageContainerHeight = 300;

const OtherUserPostDetailScreen = ({ route }) => {
  const [postDetails, setPostDetails] = useState(null);
  const { postId, petId, petProfilePic } = route.params;
  const currentPetId = useSelector(state => state.petProfile.currentPetId);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/post_media/${postId}/full/`);
        const data = await response.json();
        setPostDetails(data);
      } catch (error) {
        console.error("Failed to fetch post details", error);
      }

      // Fetch the like count
      try {
        const likeCountResponse = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/likecount/`);
        const likeCountData = await likeCountResponse.json();
        setLikeCount(likeCountData.like_count);
      } catch (error) {
        console.error("Error fetching like count:", error);
      }

      // Fetch Like Status
      const accessToken = await SecureStorage.getItem("access");
      if (accessToken) {
        try {
          const likeStatusResponse = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/likestatus/${currentPetId}/`, {
            method: "GET",
            headers: {
              "Authorization": `JWT ${accessToken}`,
            },
          });
          if (likeStatusResponse.ok) {
            const likeStatusData = await likeStatusResponse.json();
            setIsLiked(likeStatusData.liked);
          }
        } catch (error) {
          console.error("Error fetching like status:", error);
        }
      }
    };

    fetchPostDetails();
  }, [postId]);

  const handleLike = async () => {
    const accessToken = await SecureStorage.getItem("access");

    if (accessToken && currentPetId) {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/like/${currentPetId}/`, {
          method: "POST",
          headers: {
            "Authorization": `JWT ${accessToken}`,
          },
        });

        if (response.ok) {
          setIsLiked(true);
          setLikeCount(prevCount => prevCount + 1);
        } else {
          console.error("Failed to like the post");
        }
      } catch (error) {
        console.error("Error liking post:", error);
      }
    }
  };

  const handleUnlike = async () => {
    const accessToken = await SecureStorage.getItem("access");
    if (accessToken && currentPetId) {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/unlike/${currentPetId}/`, {
          method: "POST",
          headers: {
            "Authorization": `JWT ${accessToken}`,
          },
        });

        if (response.ok) {
          setIsLiked(false);
          setLikeCount(prevCount => Math.max(prevCount - 1, 0));
        } else {
          console.error("Failed to unlike the post");
        }
      } catch (error) {
        console.error("Error unliking post:", error);
      }
    }
  };

  const renderLikeIcon = () => {
    const iconName = isLiked ? "heart" : "heart-outline";
    const iconColor = isLiked ? "red" : "black";
    const onPressLikeIcon = () => {
      if (isLiked) {
        handleUnlike();
      } else {
        handleLike();
      }
    };
    return (
      <View style={styles.likeIconContainer}>
        <Ionicons name={iconName} size={24} color={iconColor} onPress={onPressLikeIcon} />
        <Text style={styles.likeCountText}>{likeCount}</Text>
      </View>
    );
  };

  if (!postDetails) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: petProfilePic }} style={styles.profilePic} />
        <Text style={styles.username}>{petId}</Text>
      </View>

      <View style={{ height: imageContainerHeight }}>
        <SwiperFlatList
          index={0}
          showPagination
          paginationStyle={styles.paginationStyle}
          paginationStyleItem={styles.paginationStyleItem}
          data={postDetails.media}
          renderItem={({ item }) => (
            <View style={{ width, height: imageContainerHeight }}>
              <Image
                source={{ uri: item.full_size_url }}
                style={styles.imageStyle}
                resizeMode="contain"
              />
            </View>
          )}
        />
      </View>
      {renderLikeIcon()}
      <Text style={{ textAlign: "center", padding: 10 }}>{postDetails.caption}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontWeight: "bold",
  },
  paginationStyle: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
  },
  imageStyle: {
    width: "100%",
    height: "100%",
  },
  paginationStyleItem: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default OtherUserPostDetailScreen;
