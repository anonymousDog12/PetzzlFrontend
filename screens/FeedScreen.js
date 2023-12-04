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

  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  const getProfilePic = (petProfilePic, petType) => {
    return petProfilePic || DEFAULT_PROFILE_PICS[petType] || DEFAULT_PROFILE_PICS['other'];
  };


  const handlePostUpload = async ({ selectedPhotos, caption, petId }) => {
    setIsUploading(true);

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

  const renderLikeIcon = () => {
    return (
      <View style={styles.likeIconContainer}>
        <Ionicons name="heart-outline" size={24} color="black" />
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
          {renderLikeIcon()}
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
