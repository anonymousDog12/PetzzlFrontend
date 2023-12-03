import React, { useEffect, useState } from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Progress from "react-native-progress";
import SecureStorage from "react-native-secure-storage";
import { useDispatch, useSelector } from "react-redux";
import { CONFIG } from "../config";
import { addPost, fetchFeed } from "../redux/actions/feed";
import { DEFAULT_PROFILE_PICS} from "../data/FieldNames";
import { SwiperFlatList } from 'react-native-swiper-flatlist';


const screenWidth = Dimensions.get("window").width;

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

  // If there are post details, upload the post
  useEffect(() => {
    if (postDetails) {
      handlePostUpload(postDetails);
    }
  }, [postDetails]);

  const renderMedia = (mediaItems) => {
    if (mediaItems && mediaItems.length > 1) {
      // Use SwiperFlatList for multiple images
      return (
        <SwiperFlatList
          index={0}
          showPagination
          style={styles.swiper}
          paginationStyle={styles.pagination}
          paginationDefaultColor="gray"
          paginationActiveColor="white"
          paginationStyleItem={styles.paginationItem}
        >
          {mediaItems.map((item, index) => (
            <View key={index} style={[styles.child]}>
              <Image source={{ uri: item.full_size_url }} style={styles.image} />
            </View>
          ))}
        </SwiperFlatList>
      );
    } else if (mediaItems && mediaItems.length === 1) {
      // Render single image
      return (
        <Image
          source={{ uri: mediaItems[0].full_size_url }}
          style={styles.image}
        />
      );
    }
    // Return null or a placeholder if no media items are available
    return null;
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
  child: {
    width: screenWidth,
    justifyContent: 'center',
  },
  image: {
    width: screenWidth,
    height: screenWidth,
    resizeMode: "cover",
  },
});

export default FeedScreen;
