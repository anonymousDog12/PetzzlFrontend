import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { RESET_POST_STATE, UPDATE_CAPTION } from "../../redux/types";


const AddCaptionScreen = ({ route }) => {
  const { selectedPhotos } = route.params;
  const currentPetId = useSelector(state => state.petProfile.currentPetId);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const caption = useSelector(state => state.feed.caption);

  const handlePost = () => {
    dispatch({ type: RESET_POST_STATE });

    navigation.navigate("Feed", {
      postDetails: {
        selectedPhotos,
        caption,
        petId: currentPetId,
      },
    });

  };

  const handleCaptionChange = (text) => {
    dispatch({ type: UPDATE_CAPTION, payload: text }); // Dispatch action to update caption
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={30} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerText}>Add Caption</Text>
          <TouchableOpacity style={styles.postButton} onPress={handlePost}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          onChangeText={handleCaptionChange}
          value={caption}
          placeholder="Add a description..."
          placeholderTextColor="#888"
        />
        <View style={styles.photosContainer}>
          {route.params.selectedPhotos.map((photo, index) => (
            <Image key={index} source={{ uri: photo.uri }} style={styles.image} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff", // or any background color you prefer
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: 10,
    backgroundColor: "#fff", // Choose your app theme color
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  postButton: {
    padding: 8,
    backgroundColor: "#ffc02c",
    borderRadius: 5,
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    margin: 10,
    width: "90%",
    fontSize: 16,
  },
  photosContainer: {
    flex: 1,
    justifyContent: "flex-start",
    width: "100%",
  },
  image: {
    width: 100, // Set width as needed
    height: 100, // Set height as needed
    margin: 10, // Set margin as needed
  },
});

export default AddCaptionScreen;
