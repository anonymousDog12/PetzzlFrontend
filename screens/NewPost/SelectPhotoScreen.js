import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RESET_POST_STATE, UPDATE_SELECTED_PHOTOS } from "../../redux/types";
import Icon from "react-native-vector-icons/Ionicons";


const { width, height } = Dimensions.get("window");

const SelectPhotoScreen = ({ navigation }) => {
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
          // Automatically select the last photo in the album
          dispatch({
            type: UPDATE_SELECTED_PHOTOS,
            payload: [{ uri: result.edges[0].node.image.uri, order: 1 }],
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
    if (selectedPhotos.length >= 9 && !selectedPhotos.some(p => p.uri === uri)) {
      return;
    }

    let newSelectedPhotos;
    const selectedIndex = selectedPhotos.findIndex(p => p.uri === uri);

    if (selectedIndex !== -1) {
      // Deselecting a photo
      newSelectedPhotos = selectedPhotos.filter(p => p.uri !== uri);
      if (newSelectedPhotos.length === 0) {
        // If all photos are deselected, set the last touched photo as the preview
        setLastDeselectedPhoto(uri);
      }
    } else {
      // Selecting a new photo
      if (selectedPhotos.length === 0 && lastDeselectedPhoto === uri) {
        // If reselecting the last deselected photo, reset the order
        newSelectedPhotos = [{ uri, order: 1 }];
      } else {
        // Otherwise, continue adding to the selection
        newSelectedPhotos = [...selectedPhotos, { uri, order: selectedPhotos.length + 1 }];
      }
    }

    dispatch({ type: UPDATE_SELECTED_PHOTOS, payload: newSelectedPhotos });
  };


  const getSelectionOrder = (uri) => {
    const selectedPhoto = selectedPhotos.find(p => p.uri === uri);
    return selectedPhoto ? selectedPhoto.order : null;
  };

  const renderItem = ({ item }) => {
    const selectionOrder = getSelectionOrder(item.node.image.uri);
    const isSelectable = selectedPhotos.length < 9 || selectionOrder !== null;

    return (
      <TouchableOpacity
        onPress={() => toggleSelectPhoto(item.node.image.uri)}
        disabled={!isSelectable}
      >
        <View style={styles.imageContainer}>
          <Image
            style={[styles.image, !isSelectable && styles.imageNotSelectable]}
            source={{ uri: item.node.image.uri }}
          />
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
              navigation.navigate("AddCaption", { selectedPhotos });
            }}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.previewContainer}>
          {selectedPhotos.length === 0 && lastDeselectedPhoto ? (
            <Image
              source={{ uri: lastDeselectedPhoto }}
              style={styles.previewPhoto}
            />
          ) : (
            selectedPhotos.length > 0 && (
              <Image
                source={{ uri: selectedPhotos[selectedPhotos.length - 1].uri }}
                style={styles.previewPhoto}
              />
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
    position: 'absolute',
    left: 10,
    top: 10,
    padding: 10, // Adjust as needed for touchable area
  },
  nextButton: {
    // Style for your "Next" button
    padding: 10,
  },
  nextButtonText: {
    // Style for the text inside your "Next" button
    color: "#007bff", // iOS blue color
    fontWeight: "bold",
    fontSize: 20,
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

export default SelectPhotoScreen;
