import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SecureStorage from "react-native-secure-storage";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { CONFIG } from "../../config";
import { deletePostSuccess } from "../redux/actions/dashboard";


const { width } = Dimensions.get("window");
const imageContainerHeight = 300;

const PostDetailScreen = ({ route }) => {
  const [postDetails, setPostDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const currentPetId = useSelector(state => state.petProfile.currentPetId);

  const { postId, petProfile } = route.params;

  const [likeCount, setLikeCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();


  const modalY = useRef(new Animated.Value(0)).current;

  const deletePost = async () => {
    setIsDeleting(true);
    const accessToken = await SecureStorage.getItem("access"); // Retrieve the access token

    if (accessToken) {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/delete_post/${postId}/`, {
          method: "DELETE",
          headers: {
            "Authorization": `JWT ${accessToken}`,
          },
        });

        if (!response.ok) {
          console.error("Failed to delete the post");
        }

        dispatch(deletePostSuccess(postId));
        navigation.goBack();
      } catch (error) {
        console.error("Deletion error:", error);
      }
    }
    setIsDeleting(false);
  };

  const showDeleteConfirmation = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: deletePost,
          style: "destructive",
        },
      ],
      { cancelable: false },
    );
  };


  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      const newY = Math.max(-5, gestureState.dy);
      modalY.setValue(newY);
    },
    onPanResponderRelease: (e, { dy }) => {
      if (dy > 50) {
        setModalVisible(false);
      } else {
        Animated.spring(modalY, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  })).current;


  const toggleModal = () => {
    setModalVisible(!modalVisible);
    modalY.setValue(0);
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
          method: "GET",
          // Add headers if necessary, such as for authentication
        });
        const data = await response.json();
        setLikeCount(data.like_count);
      } catch (error) {
        console.error("Error fetching like count:", error);
      }

      // Fetch Like Status
      if (accessToken && currentPetId) {
        try {
          const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/likestatus/${currentPetId}/`, {
            method: "GET",
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


  if (!postDetails) {
    return <Text>Loading...</Text>;
  }

  const renderLikeIcon = () => {
    const iconName = isLiked ? "heart" : "heart-outline";
    const iconColor = isLiked ? "red" : "black";

    let likeTextComponent;
    if (likeCount > 0) {
      likeTextComponent = (
        <TouchableOpacity onPress={() => navigation.navigate("LikerListScreen", { postId })}>
          <Text
            style={[styles.likeCountText, styles.boldText]}>{likeCount === 1 ? "1 like" : `${likeCount} likes`}</Text>
        </TouchableOpacity>
      );
    } else {
      likeTextComponent = <Text style={styles.likeCountText}>Be the first to like this post</Text>;
    }

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
        {likeTextComponent}
      </View>
    );
  };

  if (isDeleting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Deleting...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: petProfile.profile_pic_thumbnail_small }}
          style={styles.profilePic}
        />
        <View style={styles.petInfo}>
          <Text style={styles.username}>{petProfile.pet_name}</Text>
          <Text style={styles.postDateText}>{postDetails.posted_date}</Text>
        </View>
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
                resizeMode="contain" // This will keep the aspect ratio
                onError={(e) => console.log("Failed to load image", e.nativeEvent.error)}
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
  menuButton: {
    marginLeft: "auto",
    paddingRight: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginTop: 1,
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalView: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTextDelete: {
    marginBottom: 15,
    color: "red",
    textAlign: "center",
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
  petInfo: {
    flexDirection: "column",
    justifyContent: "center",
    flex: 1,
  },

  postDateText: {
    fontSize: 14,
    color: "gray",
  },
  username: {
    fontWeight: "bold",
  },
  boldText: {
    fontWeight: "bold",
  },
  likeIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 5,
    marginLeft: 10,
  },
  likeCountText: {
    marginLeft: 5,
  },

});

export default PostDetailScreen;
