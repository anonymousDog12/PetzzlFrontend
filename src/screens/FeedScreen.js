import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from "react-native-progress";
import SecureStorage from "react-native-secure-storage";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { CONFIG } from "../../config";
import { DEFAULT_PROFILE_PICS } from "../data/FieldNames";
import { addPost, fetchFeed } from "../redux/actions/feed";


const { width } = Dimensions.get("window");
const imageContainerHeight = 300;


const FeedScreen = ({ route }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const isFocused = useIsFocused();
  const feedData = useSelector(state => state.feed.feed);
  const dispatch = useDispatch();
  const { postDetails } = route.params || {};
  const [likeCounts, setLikeCounts] = useState({});
  const currentPetId = useSelector(state => state.petProfile.currentPetId);
  const [likeStatuses, setLikeStatuses] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const hasNextPage = useSelector(state => state.feed.hasNextPage);

  const [isGlobalLoading, setIsGlobalLoading] = useState(false);


  useEffect(() => {
    // Fetch the first page when the component mounts
    dispatch(fetchFeed(1));
  }, [dispatch]);

  const loadMore = () => {
    if (!isLoadingPage && hasNextPage) {
      setIsLoadingPage(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      dispatch(fetchFeed(nextPage));
    }
  };

  useEffect(() => {
    // Check if new data is loaded by comparing the length of feedData before and after
    const isDataLoaded = feedData.length > 0 && currentPage > 1;
    if (isDataLoaded) {
      setIsLoadingPage(false);
    }
  }, [feedData, currentPage]);


  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      if (isFocused && Array.isArray(feedData)) {
        setIsGlobalLoading(true);
        const fetchPromises = feedData.flatMap(post => [
          fetchLikeCount(post.post_id),
          fetchLikeStatus(post.post_id, currentPetId),
        ]);

        try {
          await Promise.all(fetchPromises);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          if (active) {
            setIsGlobalLoading(false);
          }
        }
      }
    };

    fetchData();

    return () => {
      active = false; // Prevents setting state on unmounted component
    };
  }, [feedData, currentPetId, isFocused]);


  // If there are post details, upload the post
  useEffect(() => {
    if (postDetails) {
      handlePostUpload(postDetails);
    }
  }, [postDetails]);


  const navigation = useNavigation();

  const handlePetProfileClick = (petId) => {
    if (petId === currentPetId) {
      navigation.navigate("Dashboard"); // Navigate to current user's Dashboard
    } else {
      navigation.navigate("OtherUserDashboard", { otherPetId: petId }); // Navigate to Other Pet's Dashboard
    }
  };

  const getProfilePic = (petProfilePic, petType) => {
    return petProfilePic || DEFAULT_PROFILE_PICS[petType] || DEFAULT_PROFILE_PICS["other"];
  };


  const handlePostUpload = async ({ selectedPhotos, caption, petId }) => {
    setIsUploading(true);

    // TODO: move get accessToken up
    const accessToken = await SecureStorage.getItem("access");
    if (!accessToken) {
      console.error("JWT token not found");
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("pet_id", petId);
    formData.append("caption", caption);

    selectedPhotos.forEach((media, index) => {
      formData.append("media_files", {
        name: `media_${index}${media.extension}`, // Use the original extension
        type: media.mimeType, // Use the mimeType from Redux state
        uri: media.uri,
      });
    });


    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/create_post/`, {
        method: "POST",
        headers: {
          "Authorization": `JWT ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Post created successfully:", result);
        dispatch(addPost(result));
        setPostSuccess(true);
        dispatch(fetchFeed()); // Fetch the updated feed
      } else {
        const errorResponse = await response.json();
        if (errorResponse.error_type === "inappropriate_content") {
          Alert.alert(
            "Quick Check Needed", // This is the title of the alert
            errorResponse.message, // This is the body of the alert
            [{ text: "OK" }], // Array of buttons
          );
        } else {
          // Handle other types of errors
          console.error(`HTTP error! status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const fetchLikeCount = async (postId) => {
    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/likecount/`, {
        method: "GET",
        // Add headers if necessary, such as for authentication
      });
      const data = await response.json();
      setLikeCounts(prevCounts => ({ ...prevCounts, [postId]: data.like_count }));
    } catch (error) {
      console.error("Error fetching like count:", error);
    }
  };

  const fetchLikeStatus = async (postId, petId) => {
    const accessToken = await SecureStorage.getItem("access");

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/likestatus/${petId}/`, {
        method: "GET",
        headers: {
          "Authorization": `JWT ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const data = await response.json();
      setLikeStatuses(prevStatuses => ({ ...prevStatuses, [postId]: data.liked }));
    } catch (error) {
      console.error("Error fetching like status:", error);
    }
  };


  const handleLike = async (postId, petId) => {
    const accessToken = await SecureStorage.getItem("access");
    if (accessToken) {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/like/${petId}/`, {
          method: "POST",
          headers: {
            "Authorization": `JWT ${accessToken}`,
          },
        });

        if (response.ok) {
          // Update like status and count
          setLikeStatuses(prevStatuses => ({ ...prevStatuses, [postId]: true }));
          setLikeCounts(prevCounts => ({ ...prevCounts, [postId]: (prevCounts[postId] || 0) + 1 }));
        } else {
          console.error("Failed to like the post");
        }
      } catch (error) {
        console.error("Error liking post:", error);
      }
    }
  };

  const handleUnlike = async (postId, petId) => {
    const accessToken = await SecureStorage.getItem("access");
    if (accessToken) {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/unlike/${petId}/`, {
          method: "POST",
          headers: {
            "Authorization": `JWT ${accessToken}`,
          },
        });

        if (response.ok) {
          // Update like status and count
          setLikeStatuses(prevStatuses => ({ ...prevStatuses, [postId]: false }));
          setLikeCounts(prevCounts => ({ ...prevCounts, [postId]: Math.max((prevCounts[postId] || 1) - 1, 0) }));
        } else {
          console.error("Failed to unlike the post");
        }
      } catch (error) {
        console.error("Error unliking post:", error);
      }
    }
  };


  const navigateToLikerList = (postId) => {
    navigation.navigate("LikerListScreen", { postId });
  };


  const renderLikeIcon = (postId) => {
    const iconName = likeStatuses[postId] ? "heart" : "heart-outline";
    const iconColor = likeStatuses[postId] ? "red" : "black";
    const likeCount = likeCounts[postId] || 0;

    let likeTextComponent;
    if (likeCount > 0) {
      likeTextComponent = (
        <TouchableOpacity onPress={() => navigateToLikerList(postId)}>
          <Text
            style={[styles.likeCountText, styles.boldText]}>{likeCount === 1 ? "1 like" : `${likeCount} likes`}</Text>
        </TouchableOpacity>
      );
    } else {
      likeTextComponent = <Text style={styles.likeCountText}>Be the first to like this post</Text>;
    }

    const onPressLikeIcon = () => {
      if (likeStatuses[postId]) {
        handleUnlike(postId, currentPetId);
      } else {
        handleLike(postId, currentPetId);
      }
    };

    return (
      <View style={styles.likeIconContainer}>
        <Ionicons name={iconName} size={24} color={iconColor} onPress={onPressLikeIcon} />
        {likeTextComponent}
      </View>
    );
  };


  const renderMedia = (mediaItems) => {
    if (!mediaItems || mediaItems.length === 0) {
      // Return some fallback UI or null
      return null;
    }

    // Use SwiperFlatList for multiple images or a single image with the same style
    return (
      <View style={{ height: imageContainerHeight }}>
        <SwiperFlatList
          index={0}
          showPagination
          paginationStyle={styles.paginationStyle}
          paginationDefaultColor="gray"
          paginationActiveColor="white"
          paginationStyleItem={styles.paginationStyleItem}
        >
          {mediaItems.map((item, index) => (
            // Even if it's one image, it's rendered the same way as multiple
            <View key={`media-item-${index}`} style={{ width, height: imageContainerHeight }}>
              <Image source={{ uri: item.full_size_url }}
                     style={styles.imageStyle}
                     resizeMode="contain" // This will keep the aspect ratio
              />
            </View>
          ))}
        </SwiperFlatList>
      </View>
    );
  };


  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {postDetails && isUploading && <Progress.Bar indeterminate={true} width={200} />}
        {postSuccess && <Text>Post successful! {" "}✓</Text>}
        {Array.isArray(feedData) && feedData.map((post, index) => (
          <View key={index} style={styles.postContainer}>
            <View style={styles.profileHeader}>
              <TouchableOpacity onPress={() => handlePetProfileClick(post.pet_id)} style={styles.profileInfoContainer}>
                <Image
                  source={{ uri: getProfilePic(post.pet_profile_pic, post.pet_type) }}
                  style={styles.profilePic}
                />
                <View style={styles.petInfo}>
                  <Text style={styles.petIdText}>{post.pet_id}</Text>
                  <Text style={styles.postDateText}>{post.posted_date}</Text>
                </View>
              </TouchableOpacity>
            </View>
            {renderMedia(post.media)}
            {renderLikeIcon(post.post_id)}
            <Text>{post.caption}</Text>
          </View>
        ))}
        <TouchableOpacity onPress={loadMore} style={styles.loadMoreContainer}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>

      </ScrollView>
      {isGlobalLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#ffc02c" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  loadMoreContainer: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    margin: 10,
  },
  loadMoreText: {
    color: "#ffc02c",
    fontSize: 16,
  },
  boldText: {
    fontWeight: "bold",
  },
  postContainer: {
    width: "100%",
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  paginationStyle: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
  },
  paginationStyleItem: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  imageStyle: {
    width: "100%",
    height: "100%",
  },
  likeIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 5,
    marginLeft: 10,
  },
  profileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  petInfo: {
    flexDirection: "column",
    justifyContent: "center",
    marginLeft: 10,
  },
  petIdText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  postDateText: {
    fontSize: 14,
    color: "gray",
  },
});

export default FeedScreen;
