import React, { useEffect, useState } from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Progress from "react-native-progress";
import SecureStorage from "react-native-secure-storage";
import { useDispatch, useSelector } from "react-redux";
import { CONFIG } from "../config";
import { addPost, fetchFeed } from "../redux/actions/feed";
import { DEFAULT_PROFILE_PICS} from "../data/FieldNames";
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import Ionicons from 'react-native-vector-icons/Ionicons';



const { width } = Dimensions.get('window');
const imageContainerHeight = 300;


const FeedScreen = ({ route }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const feedData = useSelector(state => state.feed.feed);
  const dispatch = useDispatch();
  const { postDetails } = route.params || {};
  const [likeCounts, setLikeCounts] = useState({});
  const currentPetId = useSelector(state => state.petProfile.currentPetId);
  const [likeStatuses, setLikeStatuses] = useState({});


  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  const getProfilePic = (petProfilePic, petType) => {
    return petProfilePic || DEFAULT_PROFILE_PICS[petType] || DEFAULT_PROFILE_PICS['other'];
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
        console.error(`HTTP error! status: ${response.status}`);
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
        method: 'GET',
        // Add headers if necessary, such as for authentication
      });
      const data = await response.json();
      setLikeCounts(prevCounts => ({ ...prevCounts, [postId]: data.like_count }));
    } catch (error) {
      console.error('Error fetching like count:', error);
    }
  };

  const fetchLikeStatus = async (postId, petId) => {
    const accessToken = await SecureStorage.getItem("access");

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/likestatus/${petId}/`, {
        method: 'GET',
        headers: {
          "Authorization": `JWT ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const data = await response.json();
      setLikeStatuses(prevStatuses => ({ ...prevStatuses, [postId]: data.liked }));
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };


  const handleLike = async (postId, petId) => {
    const accessToken = await SecureStorage.getItem("access");
    if (accessToken) {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/like/${petId}/`, {
          method: 'POST',
          headers: {
            "Authorization": `JWT ${accessToken}`
          }
        });

        if (response.ok) {
          // Update like status and count
          setLikeStatuses(prevStatuses => ({ ...prevStatuses, [postId]: true }));
          setLikeCounts(prevCounts => ({ ...prevCounts, [postId]: (prevCounts[postId] || 0) + 1 }));
        } else {
          console.error('Failed to like the post');
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
          method: 'POST',
          headers: {
            "Authorization": `JWT ${accessToken}`
          }
        });

        if (response.ok) {
          // Update like status and count
          setLikeStatuses(prevStatuses => ({ ...prevStatuses, [postId]: false }));
          setLikeCounts(prevCounts => ({ ...prevCounts, [postId]: Math.max((prevCounts[postId] || 1) - 1, 0) }));
        } else {
          console.error('Failed to unlike the post');
        }
      } catch (error) {
        console.error("Error unliking post:", error);
      }
    }
  };



  useEffect(() => {
    if (currentPetId) {
      feedData.forEach(post => {
        fetchLikeCount(post.post_id);  // You already have this for fetching like counts
        fetchLikeStatus(post.post_id, currentPetId);
      });
    }
  }, [feedData, currentPetId]);


  const renderLikeIcon = (postId) => {
    const iconName = likeStatuses[postId] ? 'heart' : 'heart-outline';
    const iconColor = likeStatuses[postId] ? 'red' : 'black';

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
        <Text>{likeCounts[postId] || 0}</Text>
      </View>
    );
  };




  // If there are post details, upload the post
  useEffect(() => {
    if (postDetails) {
      handlePostUpload(postDetails);
    }
  }, [postDetails]);

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
                     resizeMode='contain' // This will keep the aspect ratio
              />
            </View>
          ))}
        </SwiperFlatList>
      </View>
    );
  };



  return (
    <ScrollView contentContainerStyle={styles.container}>
      {postDetails && isUploading && <Progress.Bar indeterminate={true} width={200} />}
      {postSuccess && <Text>Post successful! {" "}✓</Text>}
      {feedData.map((post, index) => (
        <View key={index} style={styles.postContainer}>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: getProfilePic(post.pet_profile_pic, post.pet_type) }}
              style={styles.profilePic}
            />
            <Text>{post.pet_id}</Text>
          </View>
          {renderMedia(post.media)}
          {renderLikeIcon(post.post_id)}
          <Text>{post.caption}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    // justifyContent and alignItems removed for better scrolling
  },
  postContainer: {
    width: '100%', // Ensure full width
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profilePic: {
    width: 50, // Adjust size as needed
    height: 50, // Adjust size as needed
    borderRadius: 25, // Half of width/height to make it circular
    marginRight: 10,
  },
  petIdText: {
    fontSize: 16,
  },
  paginationStyle: {
    position: 'absolute',
    bottom: 15, // Adjust this value to place the dots just above the bottom of the image container
    alignSelf: 'center',
  },
  paginationStyleItem: {
    width: 8, // Set the width of the dots
    height: 8, // Set the height of the dots
    borderRadius: 4, // Half of either width or height will ensure a circular shape
  },
  imageStyle: {
    width: '100%',
    height: '100%',
  },
  likeIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 5,
    marginLeft: 10, // Adjust as needed
  },
});

export default FeedScreen;
