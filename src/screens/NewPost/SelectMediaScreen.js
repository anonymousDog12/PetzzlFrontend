import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Video from "react-native-video";
import { useDispatch, useSelector } from "react-redux";
import { RESET_POST_STATE, UPDATE_SELECTED_PHOTOS } from "../../redux/types";


const { width, height } = Dimensions.get("window");

const SelectMediaScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [photos, setPhotos] = useState([]);
  const [lastDeselectedPhoto, setLastDeselectedPhoto] = useState(null);
  const selectedPhotos = useSelector(state => state.feed.selectedPhotos);


  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const result = await CameraRoll.getPhotos({
          first: 20,
          assetType: "Photos",
        });
        setPhotos(result.edges);

        if (result.edges.length > 0) {
          // Automatically select the last media in the album and determine its MIME type and extension
          const lastMedia = result.edges[0].node.image;
          const isVideo = lastMedia.playableDuration > 0;
          const mimeType = isVideo ? `video/${lastMedia.extension}` : `image/${lastMedia.extension}`;
          const extension = `.${lastMedia.extension}`;

          dispatch({
            type: UPDATE_SELECTED_PHOTOS,
            payload: [{
              uri: lastMedia.uri,
              mimeType,
              extension,
              order: 1,
            }],
          });
        }
      } catch (error) {
        console.error("Error fetching photos", error);
      }
    };

    fetchPhotos();

    return () => {
      dispatch({ type: RESET_POST_STATE });
    };
  }, [dispatch]);


  const toggleSelectPhoto = (uri) => {
    if ((selectedPhotos.some(photo => photo.mimeType.startsWith("video")) && !selectedPhotos.some(p => p.uri === uri)) ||
      (selectedPhotos.length >= 9 && !selectedPhotos.some(p => p.uri === uri))) {
      return;
    }

    let newSelectedPhotos;
    const selectedIndex = selectedPhotos.findIndex(p => p.uri === uri);

    if (selectedIndex !== -1) {
      // Deselecting a photo/video
      newSelectedPhotos = selectedPhotos.filter(p => p.uri !== uri);
      newSelectedPhotos = newSelectedPhotos.map((photo, index) => ({ ...photo, order: index + 1 }));
      if (newSelectedPhotos.length === 0) {
        setLastDeselectedPhoto(uri);
      }
    } else {
      // Selecting a new photo/video
      const mediaItem = photos.find(p => p.node.image.uri === uri).node.image;
      const mimeType = mediaItem.playableDuration > 0 ? `video/${mediaItem.extension}` : `image/${mediaItem.extension}`;
      const extension = `.${mediaItem.extension}`;

      if (mediaItem.playableDuration > 0 && selectedPhotos.length > 0) {
        // If selecting a video and there are already selected items, do not proceed.
        return;
      }

      if (selectedPhotos.length === 0 && lastDeselectedPhoto === uri) {
        newSelectedPhotos = [{ uri, mimeType, extension, order: 1 }];
      } else {
        newSelectedPhotos = [...selectedPhotos, { uri, mimeType, extension, order: selectedPhotos.length + 1 }];
      }
    }

    dispatch({ type: UPDATE_SELECTED_PHOTOS, payload: newSelectedPhotos });
  };


  const getSelectionOrder = (uri) => {
    const selectedPhoto = selectedPhotos.find(p => p.uri === uri);
    return selectedPhoto ? selectedPhoto.order : null;
  };

  const renderItem = ({ item }) => {
    const media = item.node.image;
    const isVideo = media.playableDuration > 0;
    const selectionOrder = getSelectionOrder(media.uri);

    const isSelectable = isVideo ?
      (selectedPhotos.length === 0 || selectionOrder !== null) :
      (selectedPhotos.length < 9 && !selectedPhotos.some(photo => photo.mimeType.startsWith("video")) || selectionOrder !== null);

    return (
      <TouchableOpacity
        onPress={() => toggleSelectPhoto(media.uri)}
        disabled={!isSelectable}
      >
        <View style={styles.imageContainer}>
          {isVideo ? (
            <View>
              <Image
                style={[styles.image, !isSelectable && styles.imageNotSelectable]}
                source={{ uri: media.uri }}
              />
              <Icon name="play-circle" size={30} color="#FFF" style={styles.playIcon} />
            </View>
          ) : (
            <Image
              style={[styles.image, !isSelectable && styles.imageNotSelectable]}
              source={{ uri: media.uri }}
            />
          )}
          {isSelectable && (
            <View
              style={[
                styles.circle,
                selectionOrder !== null ? styles.circleSelected : {},
              ]}
            >
              {selectionOrder !== null && (
                <Text style={styles.circleText}>{selectionOrder}</Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const isNextButtonEnabled = selectedPhotos.length > 0;

  const getMediaType = (uri) => {
    const media = photos.find(p => p.node.image.uri === uri);
    return media && media.node.type === "video" ? "video" : "photo";
  };

  const convertPHtoAssetsUri = (phUri) => {
    const uriId = phUri.split("/")[2];
    return `assets-library://asset/asset.mp4?id=${uriId}&ext=mp4`;
  };

  const renderPreview = (uri) => {
    const mediaType = getMediaType(uri);

    if (mediaType === "video") {
      const assetUri = convertPHtoAssetsUri(uri);
      return (
        <Video
          source={{ uri: assetUri }}
          style={styles.previewPhotoVideo}
          controls
          resizeMode="contain"
        />
      );
    } else {
      return (
        <Image
          source={{ uri: uri }}
          style={styles.previewPhotoImage}
        />
      );
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}>
            <Icon name="close" size={30} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => {
              if (isNextButtonEnabled) {
                navigation.navigate("AddCaption", { selectedPhotos });
              }
            }}
            disabled={!isNextButtonEnabled}
          >
            <Text style={[styles.nextButtonText, !isNextButtonEnabled && styles.nextButtonDisabledText]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.previewContainer}>
          {selectedPhotos.length === 0 && lastDeselectedPhoto ? (
            <React.Fragment>
              {renderPreview(lastDeselectedPhoto)}
            </React.Fragment>
          ) : (
            selectedPhotos.length > 0 && (
              <React.Fragment>
                {renderPreview(selectedPhotos[selectedPhotos.length - 1].uri)}
              </React.Fragment>
            )
          )}
        </View>

        <FlatList
          data={photos}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={4}
          style={styles.photoList}
        />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  previewPhotoImage: {
    width: width, // Full width
    height: "100%", // Full height of the preview container
    resizeMode: "contain", // Contain the aspect ratio within the preview container
  },
  previewPhotoVideo: {
    width: width, // Full width
    height: "100%", // Full height of the preview container
    // Add other styles specific to video if needed
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  header: {
    height: 50, // Set the height for the header
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row",
    paddingRight: 10, // Add padding to the right
  },
  closeButton: {
    position: "absolute",
    left: 10,
    top: 10,
    padding: 10, // Adjust as needed for touchable area
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }], // Adjust size of the icon if needed
  },
  nextButton: {
    padding: 10,
  },
  nextButtonText: {
    color: "#ffc02c",
    fontWeight: "bold",
    fontSize: 20,
  },
  nextButtonDisabledText: {
    color: "#ccc", // Change color to indicate disabled state
  },
  previewContainer: {
    height: height / 2, // Half the screen height for the preview
    width: "100%", // Full width
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10, // Add some margin if needed
  },
  previewPhoto: {
    width: width, // Full width
    height: "100%", // Full height of the preview container
    resizeMode: "contain", // Contain the aspect ratio within the preview container
  },
  photoList: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    width: width / 4,
    height: width / 4,
    borderWidth: 0.5,
    borderColor: "gray",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  circle: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 2,
    borderColor: "#c4c4c4", // Changed to a neutral color for unselected photos
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent", // Ensure the background is transparent for unselected photos
  },
  circleSelected: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 2,
    borderColor: "blue",
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
  },
  circleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  imageNotSelectable: {
    opacity: 0.5,
  },
});

export default SelectMediaScreen;
