import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import Ionicons from "react-native-vector-icons/Ionicons";
import Video from "react-native-video";


const screenWidth = Dimensions.get("window").width;

const PostSection = ({
                       petProfile,
                       postDetails,
                       onEllipsisPress,
                       showEllipsis = true,
                       isLiked,
                       likeCount,
                       handleLikePress,
                       handlePetProfileClick,
                     }) => {


  const navigation = useNavigation();

  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [captionHeight, setCaptionHeight] = useState(0);

  const [firstImageAspectRatio, setFirstImageAspectRatio] = useState(null);

  const lineHeight = 18;
  const maxLines = 3;
  const maxHeight = lineHeight * maxLines;

  const [isPaused, setIsPaused] = useState(true);

  const toggleCaptionExpand = () => {
    setIsCaptionExpanded(!isCaptionExpanded);
  };

  const togglePlayPause = () => {
    setIsPaused(!isPaused);
  };


  const navigateToLikerList = () => {
    navigation.navigate("LikerListScreen", { postId: postDetails.post_id });
  };

  const renderLikeIcon = () => {
    const iconName = isLiked ? "heart" : "heart-outline";
    const iconColor = isLiked ? "red" : "black";

    let likeTextComponent;
    if (likeCount > 0) {
      likeTextComponent = (
        <TouchableOpacity onPress={navigateToLikerList}>
          <Text style={[styles.likeCountText, styles.boldText]}>
            {likeCount === 1 ? "1 like" : `${likeCount} likes`}
          </Text>
        </TouchableOpacity>
      );
    } else {
      likeTextComponent = <Text style={styles.likeCountText}>Be the first to like this post</Text>;
    }

    return (
      <View style={styles.likeIconContainer}>
        <Ionicons name={iconName} size={24} color={iconColor} onPress={handleLikePress} />
        {likeTextComponent}
      </View>
    );
  };

  const renderMediaItem = ({ item, index }) => {
    const onMediaLoad = (e) => {
      if (index === 0) {
        const { width, height } = e.nativeEvent.source;
        const aspectRatio = height / width;
        setFirstImageAspectRatio(aspectRatio);
      }
    };

    const mediaHeight = firstImageAspectRatio
      ? screenWidth * firstImageAspectRatio
      : 200; // Provide a default height if the aspect ratio is not set


    if (item.media_type === "video") {
      return (
        <TouchableOpacity
          style={{ width: screenWidth, height: mediaHeight }}
          onPress={togglePlayPause}
        >
          <Video
            source={{ uri: item.full_size_url }}
            style={styles.mediaStyle}
            resizeMode="contain"
            repeat={true}
            paused={isPaused}
            onError={(e) => console.log("Video error:", e)}
          />
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={{ width: screenWidth, height: mediaHeight }}>
          <Image
            source={{ uri: item.full_size_url }}
            style={styles.mediaStyle}
            resizeMode="contain"
            onLoad={onMediaLoad}
            onError={(e) => console.log("Image loading error:", e.nativeEvent.error)}
          />
        </View>
      );
    }
  };


  return (
    <View style={styles.postSectionContainer}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handlePetProfileClick} disabled={!handlePetProfileClick}>
          <Image
            source={{ uri: petProfile.profile_pic_thumbnail_small }}
            style={styles.profilePic}
          />
        </TouchableOpacity>
        <View style={styles.petInfo}>
          <Text style={styles.username}>{petProfile.pet_name}</Text>
          <Text style={styles.postDateText}>{postDetails.posted_date}</Text>
        </View>
        {showEllipsis && (
          <TouchableOpacity style={styles.menuButton} onPress={onEllipsisPress}>
            <Ionicons name="ellipsis-horizontal" size={20} color="black" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.swiperContainer}>
        <SwiperFlatList
          index={0}
          showPagination
          paginationStyle={styles.paginationStyle}
          paginationStyleItem={styles.paginationStyleItem}
          data={postDetails.media}
          renderItem={renderMediaItem}
        />
      </View>
      {renderLikeIcon()}
      <Text
        numberOfLines={isCaptionExpanded ? undefined : maxLines}
        style={styles.captionText}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setCaptionHeight(height);
        }}
      >
        {postDetails.caption}
      </Text>
      {!isCaptionExpanded && captionHeight > maxHeight && (
        <TouchableOpacity onPress={toggleCaptionExpand}>
          <Text style={styles.moreText}>
            ...more
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  postSectionContainer: {
    backgroundColor: "white",
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
  menuButton: {
    marginLeft: "auto",
    paddingRight: 10,
  },
  paginationStyleItem: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paginationStyle: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
  },

  swiperContainer: {
    width: screenWidth,
  },

  // Image
  mediaStyle: {
    width: "100%",
    height: "100%",
  },

  // Caption
  captionText: {
    textAlign: "left",
    fontSize: 15,
    fontWeight: "300",
    color: "#333",
    marginBottom: 10,
    padding: 10,
  },

  // Post Reactions
  likeCountText: {
    marginLeft: 5,
  },
  likeIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 5,
    marginLeft: 10,
  },
  boldText: {
    fontWeight: "bold",
  },


  moreText: {
    color: "#0645AD",
    paddingLeft: 10,
  },
});

export default PostSection;
