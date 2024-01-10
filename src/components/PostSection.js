import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import Ionicons from "react-native-vector-icons/Ionicons";


const imageContainerHeight = 300;


const PostSection = ({
                       petProfile,
                       postDetails,
                       onEllipsisPress,
                       showEllipsis = true,
                       isLiked,
                       likeCount,
                       handleLikePress,
                       navigateToLikerList,
                       handlePetProfileClick,
                     }) => {


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

  const renderMediaItem = ({ item }) => {
    return (
      <View style={{ width: Dimensions.get("window").width, height: imageContainerHeight }}>
        <Image
          source={{ uri: item.full_size_url }}
          style={styles.imageStyle}
          resizeMode="contain"
        />
      </View>
    );
  };

  return (
    <View>
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
      <View style={{ height: imageContainerHeight }}>
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
      <Text style={{ textAlign: "center", padding: 10 }}>{postDetails.caption}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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

  // Image
  imageStyle: {
    width: "100%",
    height: "100%",
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
});

export default PostSection;
