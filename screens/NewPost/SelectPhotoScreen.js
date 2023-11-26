import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";


const { width, height } = Dimensions.get("window");

const SelectPhotoScreen = ({ navigation }) => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const result = await CameraRoll.getPhotos({
          first: 20,
          assetType: "Photos",
        });
        setPhotos(result.edges);
      } catch (error) {
        console.error("Error fetching photos", error);
      }
    };

    fetchPhotos();
  }, []);

  const toggleSelectPhoto = (uri) => {
    const selectedIndex = selectedPhotos.findIndex(p => p.uri === uri);
    if (selectedIndex !== -1) {
      setSelectedPhotos(selectedPhotos.filter(p => p.uri !== uri));
    } else {
      setSelectedPhotos([...selectedPhotos, { uri, order: selectedPhotos.length + 1 }]);
    }
  };

  const getSelectionOrder = (uri) => {
    const selectedPhoto = selectedPhotos.find(p => p.uri === uri);
    return selectedPhoto ? selectedPhoto.order : null;
  };

  const renderItem = ({ item }) => {
    const selectionOrder = getSelectionOrder(item.node.image.uri);
    return (
      <TouchableOpacity onPress={() => toggleSelectPhoto(item.node.image.uri)}>
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{ uri: item.node.image.uri }} />
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
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            navigation.navigate("AddCaption", { selectedPhotos });
          }}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.previewContainer}>
        {selectedPhotos.length > 0 && (
          <Image
            source={{ uri: selectedPhotos[selectedPhotos.length - 1].uri }}
            style={styles.previewPhoto}
          />
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
  );
};


const styles = StyleSheet.create({
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
  nextButton: {
    // Style for your "Next" button
    padding: 10,
  },
  nextButtonText: {
    // Style for the text inside your "Next" button
    color: "#007bff", // iOS blue color
    fontWeight: "bold",
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
});

export default SelectPhotoScreen;