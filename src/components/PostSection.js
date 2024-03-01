import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import Ionicons from "react-native-vector-icons/Ionicons";
import Video from "react-native-video";


const screenWidth = Dimensions.get("window").width;


// TODO: Further Cleanup

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
  const [firstImageAspectRatio, setFirstImageAspectRatio] = useState(null);
  const [videoPlayStates, setVideoPlayStates] = useState(postDetails.media ? postDetails.media.map(() => false) : []);

  const toggleCaptionExpand = () => {
    setIsCaptionExpanded(!isCaptionExpanded);
  };

  const processCaption = (caption = "", charLimit = 100) => {  // Default caption to an empty string if undefined
    const shouldShowMore = caption.length > charLimit || caption.includes("\n");
    let trimmedCaption = caption;

    if (!isCaptionExpanded) {
      trimmedCaption = caption.slice(0, charLimit);
      const newlineIndex = trimmedCaption.indexOf("\n");
      if (newlineIndex !== -1) {
        trimmedCaption = trimmedCaption.slice(0, newlineIndex);
      }
    }

    return { trimmedCaption, shouldShowMore };
  };


  const { trimmedCaption, shouldShowMore } = processCaption(postDetails.caption);

  const toggleVideoPlay = (index) => {
    setVideoPlayStates(videoPlayStates.map((state, idx) => (idx === index ? !state : state)));
  };

  const navigateToLikerList = () => {
    navigation.navigate("LikerListScreen", { postId: postDetails.post_id });
  };

  const onCommentIconPress = () => {
    navigation.navigate("CommentScreen", { postId: postDetails.post_id, petId: petProfile.pet_id});
  };

  const renderPostIcons = () => {
    const heartIconName = isLiked ? "heart" : "heart-outline";
    const heartIconColor = isLiked ? "red" : "black";
    const commentIconName = "chatbox-ellipses-outline";

    let likeTextComponent;
    if (likeCount > 0) {
      likeTextComponent = (
        <TouchableOpacity onPress={navigateToLikerList}>
          <Text style={styles.boldText}>
            {likeCount === 1 ? "1 like" : `${likeCount} likes`}
          </Text>
        </TouchableOpacity>
      );
    } else {
      likeTextComponent = <Text>Be the first to like this post</Text>;
    }

    return (
      <View style={styles.likeIconContainer}>
        <View style={styles.reactionsContainer}>
          <Ionicons name={heartIconName} size={24} color={heartIconColor} onPress={handleLikePress} />
          <TouchableOpacity style={styles.commentCountContainer} onPress={onCommentIconPress}>
            <Ionicons name={commentIconName} size={24} color="black" />
            {postDetails.comment_count > 0 && (
              <Text style={styles.commentCountText}>{postDetails.comment_count}</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: "flex-start", marginTop: 4 }}>
          {likeTextComponent}
        </View>
      </View>
    );
  };

  const renderLatestComment = () => {
    if (postDetails.latest_comment) {
      return (
        <View style={styles.latestCommentContainer}>
          <Text style={styles.latestCommentText}>
            <Text style={styles.boldText}>{postDetails.latest_comment.pet_id}</Text> {postDetails.latest_comment.content}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderViewAllCommentsText = () => {
    if (postDetails.comment_count > 1) {
      return (
        <TouchableOpacity
          onPress={onCommentIconPress}
          style={styles.viewAllCommentsContainer}
        >
          <Text style={styles.viewAllCommentsText}>View More Comments</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };



  useEffect(() => {
    // Update videoPlayStates to match the current number of media items
    setVideoPlayStates(postDetails.media ? postDetails.media.map(() => false) : []);
  }, [postDetails.media]);

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
      return videoPlayStates[index] ? (
        // Video component
        <TouchableOpacity style={{ width: screenWidth, height: mediaHeight }} onPress={() => toggleVideoPlay(index)}>
          <Video
            source={{ uri: item.full_size_url }}
            style={styles.mediaStyle}
            resizeMode="contain"
            repeat={true}
            paused={!videoPlayStates[index]}
            onError={(e) => console.log("Video error:", e)}
          />
        </TouchableOpacity>
      ) : (
        // Thumbnail Image component with play icon overlay
        <TouchableOpacity style={{ width: screenWidth, height: mediaHeight }} onPress={() => toggleVideoPlay(index)}>
          <Image onLoad={onMediaLoad} source={{ uri: item.thumbnail_url }} style={styles.mediaStyle}
                 resizeMode="contain" />
          <View style={styles.playIconOverlay}>
            <Ionicons name="play-circle" size={64} color="white" style={styles.playIcon} />
          </View>
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

  const isCaptionNotEmptyOrSpaces = (caption) => /[^\s]/.test(caption);


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
          <Text style={styles.username}>{petProfile.pet_id}</Text>
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
          showPagination={postDetails.media && postDetails.media.length > 1}
          paginationStyle={styles.paginationStyle}
          paginationStyleItem={styles.paginationStyleItem}
          data={postDetails.media}
          renderItem={renderMediaItem}
        />
      </View>
      {renderPostIcons()}
      <View style={styles.captionTextContainer}>
        {isCaptionNotEmptyOrSpaces(postDetails.caption) && (
          <>
            <Text style={styles.captionText}>
              {/* Bold pet id and concatenate with the processed caption */}
              <Text style={styles.boldText}>{petProfile.pet_id}</Text>
              {` ${trimmedCaption}`}
              {!isCaptionExpanded && shouldShowMore && (
                <Text style={styles.moreText} onPress={toggleCaptionExpand}>...more</Text>
              )}
            </Text>
          </>
        )}
      </View>
      {renderViewAllCommentsText()}
      {renderLatestComment()}
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
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 2,
  },
  paginationStyle: {
    position: "absolute",
    bottom: 10,
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
    paddingHorizontal: 10,
  },
  captionTextContainer: {
    marginTop: 3,
  },

  // Post Reactions
  likeIconContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginTop: 5,
    marginLeft: 10,
  },

  reactionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  commentIcon: {
    marginLeft: 10,
  },

  boldText: {
    fontWeight: "bold",
  },


  moreText: {
    color: "#0645AD",
    paddingLeft: 10,
  },


  playIconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },

  playIcon: {
    opacity: 0.8,
  },


  modalContentContainer: {
    flexDirection: "row", // Ensures the Image and TextInput are side-by-side
    alignItems: "center", // Aligns items vertically center
    paddingVertical: 10,
  },
  commentInput: {
    flex: 1,
    marginLeft: 5,
    padding: 8,
    borderWidth: 0.2,
    borderRadius: 25,
  },


  commentProfilePicStyle: {
    width: 40,
    height: 40,
  },

  commentCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10, // Adjust spacing as needed
  },
  commentCountText: {
    marginLeft: 4, // Adjust spacing as needed
    fontSize: 14,
    color: "#666", // Adjust color as needed
  },

  latestCommentContainer: {
    paddingHorizontal: 10, // Match the padding of the caption for consistency
  },
  latestCommentText: {
    fontSize: 15, // Adjust based on your design
    color: "#333", // Adjust based on your design
    fontWeight: "300",
  },

  viewAllCommentsContainer: {
    paddingHorizontal: 10, // Match the padding for consistency
  },
  viewAllCommentsText: {
    color: "#9d9d9d",
    fontSize: 15,
    fontWeight: "300",
  },

});

export default PostSection;
