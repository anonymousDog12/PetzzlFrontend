import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, LogBox, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import Ionicons from "react-native-vector-icons/Ionicons";
import Video from "react-native-video";


LogBox.ignoreLogs(["Non-serializable values were found in the navigation state"]);

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
  const [commentCount, setCommentCount] = useState(postDetails.comment_count);
  const [latestCommentContent, setLatestCommentContent] = useState(postDetails.latest_comment ? postDetails.latest_comment.content : null);
  const [latestCommentAuthor, setLatestCommentAuthor] = useState(postDetails.latest_comment ? postDetails.latest_comment.pet_id : null);

  const toggleCaptionExpand = () => {
    setIsCaptionExpanded(!isCaptionExpanded);
  };

  const processCaption = (caption = "", charLimit = 100) => {
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

  const handleNewCommentCountReceived = ({ commentCount, latestCommentContent, latestCommentAuthorPetId }) => {
    setCommentCount(commentCount);
    setLatestCommentContent(latestCommentContent);
    setLatestCommentAuthor(latestCommentAuthorPetId);
  };


  const onCommentIconPress = () => {
    navigation.navigate("CommentScreen",
      {
        postId: postDetails.post_id, petId: petProfile.pet_id,
        onReturn: handleNewCommentCountReceived,
      },
    );
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
      <>
        <View style={styles.reactionsContainer}>
          <Ionicons name={heartIconName} size={24} color={heartIconColor} onPress={handleLikePress} />
          <TouchableOpacity style={styles.commentCountContainer} onPress={onCommentIconPress}>
            <Ionicons name={commentIconName} size={24} color="black" />
            {commentCount > 0 && (
              <Text style={styles.commentCountText}>{commentCount}</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.likeTextStyle}>
          {likeTextComponent}
        </View>
      </>
    );
  };

  const renderLatestComment = () => {
    if (latestCommentContent) {
      return (
        <View style={styles.latestCommentContainer}>
          <Text style={styles.latestCommentText}>
            <Text style={styles.boldText}>{latestCommentAuthor} </Text>{latestCommentContent}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderViewAllCommentsText = () => {
    if (commentCount > 1) {
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

  // ***************************** Profile Header ******************************
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

  // ******************************* Swiper *******************************
  swiperContainer: {
    width: screenWidth,
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


  // ******************************* Media *******************************
  mediaStyle: {
    width: "100%",
    height: "100%",
  },

  playIconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  playIcon: {
    opacity: 0.8,
  },

  // ******************************* Caption *******************************
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

  // ***************************** Post Reactions *****************************
  reactionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginLeft: 10,
  },

  likeTextStyle: {
    marginTop: 4,
    marginLeft: 10,
  },


  // ***************************** Text *****************************

  boldText: {
    fontWeight: "bold",
    fontSize: 15,
  },

  moreText: {
    color: "#0645AD",
    paddingLeft: 10,
    fontSize: 15,
  },

  // ***************************** Comment *****************************
  commentCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },

  commentCountText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },

  latestCommentContainer: {
    paddingHorizontal: 10,
  },

  latestCommentText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "300",
  },

  viewAllCommentsContainer: {
    paddingHorizontal: 10,
  },

  viewAllCommentsText: {
    color: "#9d9d9d",
    fontSize: 15,
    fontWeight: "300",
  },

});

export default PostSection;
