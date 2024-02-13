import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  NativeEventEmitter,
  NativeModules,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Video from "react-native-video";
import { isValidVideo, showEditor } from "react-native-video-trim";
import { useDispatch, useSelector } from "react-redux";
import { RESET_POST_STATE, UPDATE_SELECTED_PHOTOS } from "../../redux/types";
import { convertPHtoAssetsUri } from "../../utils/fileHandling";
import GuidelinesModal from "./GuidelinesModal";


const { width, height } = Dimensions.get("window");

const SelectMediaScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [photos, setPhotos] = useState([]);
  const [lastTouchedPhoto, setLastTouchedPhoto] = useState(null);
  const selectedMedias = useSelector(state => state.feed.selectedMedias);

  const [after, setAfter] = useState(null); // Cursor for pagination
  const [hasMore, setHasMore] = useState(true); // Whether more photos are available

  const [isLoading, setIsLoading] = useState(false);

  const [isGuidelinesModalVisible, setIsGuidelinesModalVisible] = useState(false);

  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  useEffect(() => {
    const checkGuidelines = async () => {
      const hasSeenGuidelines = await AsyncStorage.getItem("hasSeenPostGuidelines");

      if (!hasSeenGuidelines || hasSeenGuidelines === "false") {
        setIsGuidelinesModalVisible(true);
      }
    };

    checkGuidelines();
  }, []);

  const handleDismissGuidelines = async () => {
    setIsGuidelinesModalVisible(false);
    await AsyncStorage.setItem("hasSeenPostGuidelines", "true");
  };

  const fetchPhotos = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);

    // Create an object for the parameters you want to send
    let params = {
      first: 20,
      assetType: "All",
    };

    // If you have a valid cursor, add the 'after' parameter
    if (after) {
      params = { ...params, after };
    }

    try {
      const result = await CameraRoll.getPhotos(params);
      setPhotos(prevPhotos => [...prevPhotos, ...result.edges]);
      setAfter(result.page_info.end_cursor);
      setHasMore(result.page_info.has_next_page);
    } catch (error) {
      console.error("Error fetching photos", error);
    }
    setIsLoading(false);
  };


  useEffect(() => {
    fetchPhotos(); // Fetch initial photos

    return () => {
      dispatch({ type: RESET_POST_STATE });
    };
  }, [dispatch]);


  const toggleSelectPhoto = (uri) => {
    const mediaItem = photos.find(p => p.node.image.uri === uri).node.image;
    const isVideo = mediaItem.playableDuration > 0;
    let newSelectedMedias;

    const selectedIndex = selectedMedias.findIndex(p => p.uri === uri);

    if (selectedIndex !== -1) {
      // Deselecting an item
      newSelectedMedias = selectedMedias.filter(p => p.uri !== uri);
      // Update the order for remaining items
      newSelectedMedias = newSelectedMedias.map((photo, index) => ({ ...photo, order: index + 1 }));
    } else {
      // Prevent selecting more if a video is already selected or selecting a video if photos are selected
      if ((isVideo && selectedMedias.length > 0) || (!isVideo && selectedMedias.some(photo => photo.playableDuration > 0))) {
        return;
      }
      // Limit to 9 photos
      if (!isVideo && selectedMedias.length >= 9) {
        return;
      }

      const mimeType = `image/${mediaItem.extension}`;
      const extension = `.${mediaItem.extension}`;

      newSelectedMedias = [...selectedMedias, {
        uri,
        mimeType,
        extension,
        order: selectedMedias.length + 1,
        playableDuration: mediaItem.playableDuration,
      }];
    }

    dispatch({ type: UPDATE_SELECTED_PHOTOS, payload: newSelectedMedias });
  };


  const getSelectionOrder = (uri) => {
    const selectedPhoto = selectedMedias.find(p => p.uri === uri);
    return selectedPhoto ? selectedPhoto.order : null;
  };

  const renderItem = ({ item }) => {
    const media = item.node.image;
    const isVideo = item.node.type === "video";
    const selectionOrder = getSelectionOrder(media.uri);

    // Check if a video is selected
    const videoSelected = selectedMedias.some(media => media.playableDuration > 0);

    // Apply dark overlay logic
    let applyDarkOverlay = false;
    if (videoSelected && !selectionOrder) {
      // Apply overlay to all other media if a video is selected and the current item is not selected
      applyDarkOverlay = true;
    } else if (!isVideo && selectedMedias.length >= 9 && !selectionOrder) {
      // Apply overlay to other photos if 9 photos are selected and the current item is not selected
      applyDarkOverlay = true;
    } else if (!videoSelected && isVideo && selectedMedias.length > 0) {
      // Apply overlay to videos if any media is selected (and it's not a video)
      applyDarkOverlay = true;
    }

    // Determine if the current item is selectable
    let isSelectable = true;
    if (isVideo) {
      // Videos are not selectable if any media is already selected and it's not this video
      isSelectable = selectedMedias.length === 0 || selectionOrder !== null;
    } else {
      // Photos are not selectable if a video is selected or 9 photos are already selected and it's not this photo
      isSelectable = !videoSelected || selectionOrder !== null;
    }

    return (
      <TouchableOpacity onPress={() => toggleSelectPhoto(media.uri)}>
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{ uri: media.uri }} />
          {applyDarkOverlay && <View style={styles.imageOverlay} />}
          {isVideo && isSelectable && <Icon name="play-circle" size={30} color="white" style={styles.playIcon} />}
          {selectionOrder !== null && (
            <View style={[styles.circle, styles.circleSelected]}>
              <Text style={styles.circleText}>{selectionOrder}</Text>
            </View>
          )}
          {!applyDarkOverlay && !selectionOrder && isSelectable && (
            <View style={styles.circle} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const isNextButtonEnabled = selectedMedias.length > 0;

  const getMediaType = (uri) => {
    const media = photos.find(p => p.node.image.uri === uri);
    return media && media.node.type === "video" ? "video" : "photo";
  };

  useEffect(() => {
    return navigation.addListener("blur", () => {
      // Pause the video when the screen loses focus
      setIsPreviewPlaying(false);
    });
  }, [navigation]);


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
          paused={!isPreviewPlaying} // Control playback using the isPreviewPlaying state
          onLoadStart={() => setIsPreviewPlaying(true)} // Start playing when the video starts loading
          onEnd={() => setIsPreviewPlaying(false)} // Stop playing when the video ends
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

  const renderFooter = () => {
    return (
      hasMore && (
        <View style={styles.footer}>
          <ActivityIndicator size="large" color="#ffc02c" />
        </View>
      )
    );
  };


  const onPressNext = async () => {
    if (isNextButtonEnabled) {
      const selectedVideo = selectedMedias.find(photo => photo.playableDuration > 0);
      if (selectedVideo) {
        // Convert the PH URI to a file URI
        try {
          const fileData = await CameraRoll.iosGetImageDataById(selectedVideo.uri, { convertHeic: true });
          if (fileData?.node?.image?.filepath) {
            const fileUri = fileData.node.image.filepath;

            // Check if video duration is more than 15 seconds
            if (selectedVideo.playableDuration > 15) {
              // Validate the video file and show the trimmer
              isValidVideo(fileUri).then(isValid => {
                if (isValid) {
                  // Show the trimmer and wait for the trimming to finish
                  showEditor(fileUri, {
                    maxDuration: 15,
                    saveToPhoto: false,
                    cancelDialogTitle: "Cancel Editing?",
                    cancelDialogMessage: "All changes will be discarded",
                    saveDialogTitle: "Save Edits?",
                    saveDialogMessage: "Your changes will be applied",
                  });
                  const eventEmitter = new NativeEventEmitter(NativeModules.VideoTrim);
                  const subscription = eventEmitter.addListener("VideoTrim", (event) => {
                    if (event.name === "onFinishTrimming" && event.outputPath) {
                      navigation.navigate("AddCaption", {
                        selectedMedias: selectedMedias,
                        trimmedVideoPath: event.outputPath,
                      });
                      subscription.remove(); // Remove the listener to prevent memory leaks
                    }
                  });
                } else {
                  console.log("Invalid video file");
                }
              });
            } else {
              // If video is less than or equal to 15 seconds, navigate without trimming
              navigation.navigate("AddCaption", { selectedMedias });
            }
          }
        } catch (error) {
          console.error("Error converting PH URI to File URI: ", error);
        }
      } else {
        // If no videos are selected, navigate immediately to AddCaptionScreen with selected photos
        navigation.navigate("AddCaption", { selectedMedias });
      }
    }
  };


  const onPressCancel = () => {
    navigation.goBack();
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <GuidelinesModal
        visible={isGuidelinesModalVisible}
        onClose={handleDismissGuidelines}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onPressCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={onPressNext}
            disabled={!isNextButtonEnabled}
          >
            <Text style={[styles.nextButtonText, !isNextButtonEnabled && styles.nextButtonDisabledText]}>Next</Text>
          </TouchableOpacity>
        </View>


        <View style={styles.previewContainer}>
          {selectedMedias.length === 0 && !lastTouchedPhoto ? (
            <View style={styles.selectMediaMessageContainer}>
              <Text style={styles.selectMediaText}>SELECT A MEDIA BELOW TO PREVIEW</Text>
              <Icon name="arrow-down" size={20} color="white" style={styles.arrowIcon} />
            </View>
          ) : lastTouchedPhoto ? (
            <React.Fragment>
              {renderPreview(lastTouchedPhoto)}
            </React.Fragment>
          ) : (
            selectedMedias.length > 0 && (
              <React.Fragment>
                {renderPreview(selectedMedias[selectedMedias.length - 1].uri)}
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
          onEndReached={fetchPhotos} // Trigger fetching more photos when the end is reached
          onEndReachedThreshold={0.5} // Threshold - 0.5 means when 50% of the last item is visible
          ListFooterComponent={hasMore && renderFooter} // Optional: Render a footer to show a loading indicator
        />

      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  previewPhotoImage: {
    width: width,
    height: "100%",
    resizeMode: "contain",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "black",
  },
  container: {
    flex: 1,
  },
  header: {
    height: 50,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row",
  },
  selectMediaMessageContainer: {
    alignItems: "center",
  },

  selectMediaText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }], // Adjust size of the icon if needed
  },
  nextButton: {
    padding: 10,
    right: 5,
  },
  nextButtonText: {
    color: "#ffc02c",
    fontWeight: "bold",
    fontSize: 20,
  },
  nextButtonDisabledText: {
    color: "#ccc",
  },
  cancelButton: {
    position: "absolute",
    left: 5,
    padding: 10,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  previewContainer: {
    height: height / 2,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "black",
  },
  photoList: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    width: width / 4,
    height: width / 4,
    borderWidth: 0.5,
    borderColor: "black",
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
    borderColor: "#c4c4c4",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
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
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  previewPhotoVideo: {
    width: width,
    height: "100%",
  },
});

export default SelectMediaScreen;
