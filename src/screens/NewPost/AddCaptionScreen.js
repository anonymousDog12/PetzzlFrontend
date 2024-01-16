import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { RESET_POST_STATE, UPDATE_CAPTION } from "../../redux/types";


const AddCaptionScreen = ({ route }) => {
  const { selectedPhotos } = route.params;
  const currentPetId = useSelector(state => state.petProfile.currentPetId);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const caption = useSelector(state => state.feed.caption);

  const [modalVisible, setModalVisible] = useState(false);

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
    dispatch({ type: UPDATE_CAPTION, payload: text });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={24} color="#ffc02c" style={styles.backIcon} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>


          <Text style={styles.headerText}>Add Caption</Text>
          <TouchableOpacity style={styles.postButton} onPress={handlePost}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.contentContainer}>
          <TouchableOpacity style={styles.photosContainer} onPress={() => setModalVisible(true)}>
            <Image source={{ uri: selectedPhotos[0].uri }} style={styles.image} />
          </TouchableOpacity>
          <View style={styles.captionContainer}>
            <TextInput
              style={styles.input}
              onChangeText={handleCaptionChange}
              value={caption}
              placeholder="Add a description..."
              placeholderTextColor="#888"
              multiline={true}
              textAlignVertical="top"
              scrollEnabled={true}
            />

          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <SwiperFlatList
            index={0}
            showPagination
            data={selectedPhotos}
            renderItem={({ item }) => (
              <View style={styles.fullScreenImageContainer}>
                <Image source={{ uri: item.uri }} style={styles.fullScreenImage} />
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
            <Icon name="close" size={40} color="#000" />
          </TouchableOpacity>
        </Modal>
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
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: 10,
    backgroundColor: "#fff",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 18,
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  backButtonText: {
    color: "#ffc02c",
    fontSize: 20,
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
  image: {
    width: 100,
    height: 100,
    marginLeft: 10,
  },
  fullScreenImageContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },
  contentContainer: {
    flexDirection: "row",
  },
  photosContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  captionContainer: {
    flex: 1,
    padding: 10,
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    height: 100,
  },
});

export default AddCaptionScreen;
