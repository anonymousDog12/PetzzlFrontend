import React, { useEffect, useState } from 'react';
import { View, Text, Image, Dimensions, StyleSheet, SafeAreaView } from "react-native";
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { CONFIG } from "../config";

const { width } = Dimensions.get('window');
const imageContainerHeight = 300;

const PostDetailScreen = ({ route }) => {
  const [postDetails, setPostDetails] = useState(null);
  const { postId, petProfile } = route.params;


  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/post_media/${postId}/full/`);
        const data = await response.json();
        setPostDetails(data);
      } catch (error) {
        console.error("Failed to fetch post details", error);
      }
    };
    fetchPostDetails();
  }, [postId]);

  if (!postDetails) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: petProfile.profile_pic_thumbnail_small }}
          style={styles.profilePic}
        />
        <Text style={styles.username}>{petProfile.pet_name}</Text>
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
                resizeMode='contain' // This will keep the aspect ratio
                onError={(e) => console.log('Failed to load image', e.nativeEvent.error)}
              />
            </View>
          )}
        />
      </View>
      <Text style={{ textAlign: 'center', padding: 10 }}>{postDetails.caption}</Text>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  paginationStyle: {
    position: 'absolute',
    bottom: 15, // Adjust this value to place the dots just above the bottom of the image container
    alignSelf: 'center',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
  },
  paginationStyleItem: {
    width: 8, // Set the width of the dots
    height: 8, // Set the height of the dots
    borderRadius: 4, // Half of either width or height will ensure a circular shape
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10,
    backgroundColor: 'white', // or any color that suits your app design
    borderBottomWidth: 1, // optional, for a subtle separation from the content below
    borderBottomColor: '#e1e1e1', // optional, color for the border line
  },
  profilePic: {
    width: 50, // adjust the size as needed
    height: 50, // adjust the size as needed
    borderRadius: 25, // half the size to make it round
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    // add more styles if needed
  },
});

export default PostDetailScreen;
