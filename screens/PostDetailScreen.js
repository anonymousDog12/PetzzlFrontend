import { useNavigation } from "@react-navigation/native";
import SecureStorage from "react-native-secure-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert, View, Text, Image, Dimensions, StyleSheet, SafeAreaView, TouchableOpacity, Modal, PanResponder, Animated
} from "react-native";
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { useDispatch, useSelector } from "react-redux";
import { CONFIG } from "../config";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { deletePostSuccess } from "../redux/actions/dashboard";


const { width } = Dimensions.get('window');
const imageContainerHeight = 300;

const PostDetailScreen = ({ route }) => {
  const [postDetails, setPostDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const currentPetId = useSelector(state => state.petProfile.currentPetId);



  const { postId, petProfile } = route.params;

  const [likeCount, setLikeCount] = useState(0);

  const navigation = useNavigation();
  const dispatch = useDispatch();


  const modalY = useRef(new Animated.Value(0)).current;
  console.log(postId)

  const deletePost = async () => {
    const accessToken = await SecureStorage.getItem("access"); // Retrieve the access token

    if (accessToken) {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/delete_post/${postId}/`, {
          method: 'DELETE',
          headers: {
            "Authorization": `JWT ${accessToken}`
          },
        });

        if (!response.ok) {
          console.error('Failed to delete the post');
        }

        console.log(`Post ${postId} has been deleted.`); // Log the post id
        dispatch(deletePostSuccess(postId));
        navigation.goBack();
      } catch (error) {
        console.error("Deletion error:", error);
        // Handle post deletion error (e.g., show error message)
      }
    }
  };

  const showDeleteConfirmation = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: deletePost,
          style: 'destructive'
        }
      ],
      { cancelable: false }
    );
  };


  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dy: modalY }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (e, { dy }) => {
      if (dy > 50) { // Threshold to close the modal
        toggleModal();
      } else {
        // Reset position
        Animated.spring(modalY, {
          toValue: 0,
          useNativeDriver: false
        }).start();
      }
    }
  })).current;


  const toggleModal = () => {
    setModalVisible(!modalVisible);
    modalY.setValue(0); // Reset position when modal is closed or opened
  };

  useEffect(() => {
    const fetchPostDetails = async () => {
      const accessToken = await SecureStorage.getItem("access");

      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/post_media/${postId}/full/`);
        const data = await response.json();
        setPostDetails(data);
      } catch (error) {
        console.error("Failed to fetch post details", error);
      }

      // Fetch the like count
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/likecount/`, {
          method: 'GET',
          // Add headers if necessary, such as for authentication
        });
        const data = await response.json();
        setLikeCount(data.like_count);
      } catch (error) {
        console.error('Error fetching like count:', error);
      }

      // Fetch Like Status
      if (accessToken && currentPetId) {
        try {
          const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/likestatus/${currentPetId}/`, {
            method: 'GET',
            headers: {
              "Authorization": `JWT ${accessToken}`,
              "Content-Type": "application/json",
            },
          });
          if (response.ok) {
            const data = await response.json();
            setIsLiked(data.liked);
          } else {
            console.error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.error('Error fetching like status:', error);
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
          method: 'POST',
          headers: {
            "Authorization": `JWT ${accessToken}`
          }
        });

        if (response.ok) {
          setIsLiked(true);
          setLikeCount(prevCount => prevCount + 1);
        } else {
          console.error('Failed to like the post');
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
          method: 'POST',
          headers: {
            "Authorization": `JWT ${accessToken}`
          }
        });

        if (response.ok) {
          setIsLiked(false);
          setLikeCount(prevCount => Math.max(prevCount - 1, 0));
        } else {
          console.error('Failed to unlike the post');
        }
      } catch (error) {
        console.error("Error unliking post:", error);
      }
    }
  };



  if (!postDetails) {
    return <Text>Loading...</Text>;
  }

  const renderLikeIcon = () => {
    const iconName = isLiked ? 'heart' : 'heart-outline';
    const iconColor = isLiked ? 'red' : 'black';

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



  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: petProfile.profile_pic_thumbnail_small }}
          style={styles.profilePic}
        />
        <Text style={styles.username}>{petProfile.pet_name}</Text>
        <TouchableOpacity style={styles.menuButton} onPress={toggleModal}>
          <Ionicons name="ellipsis-horizontal" size={20} color="black" />
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={toggleModal}
        >
          <Animated.View
            style={[styles.modalView, { transform: [{ translateY: modalY }] }]}
            {...panResponder.panHandlers}
          >
            <View style={styles.sliderHandle} />
            <TouchableOpacity onPress={showDeleteConfirmation}>
              <Text style={styles.modalTextDelete}>Delete</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
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
      {renderLikeIcon()}
      <Text style={{ textAlign: 'center', padding: 10 }}>{postDetails.caption}</Text>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    marginLeft: 'auto', // Pushes the button to the far right
    paddingRight: 10, // Optional padding for the button
  },
  sliderHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginTop: 1,
    marginBottom: 15
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTextDelete: {
    marginBottom: 15,
    color: "red",
    textAlign: "center",
  },
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
  likeIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 5,
    marginLeft: 10, // Adjust as needed
  },
  likeCountText: {
    marginLeft: 5, // Adjust the space between the icon and the text
  },

});

export default PostDetailScreen;