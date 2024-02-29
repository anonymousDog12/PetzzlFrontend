import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SecureStorage from "react-native-secure-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { CONFIG } from "../../config";
import PostSection from "../components/PostSection";
import SliderModal from "../components/SliderModal";
import SliderModalStyles from "../components/SliderModalStyles";
import { REPORT_REASONS } from "../data/AppContants";
import { usePostLike } from "../hooks/usePostLike";
import { fetchFeed } from "../redux/actions/feed";


// TODO: The report content logic has overlaps with feed screen
// Consider refactoring this


const OtherUserPostDetailScreen = ({ route }) => {
  const dispatch = useDispatch();

  const [postDetails, setPostDetails] = useState(null);
  const { postId, petId, petProfilePic } = route.params;
  const currentPetId = useSelector(state => state.petProfile.currentPetId);

  const { isLiked, likeCount, toggleLike } = usePostLike(postId, currentPetId);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [isReportSending, setIsReportSending] = useState(false);

  const [reportMessageModalVisible, setReportMessageModalVisible] = useState(false);
  const [reportMessage, setReportMessage] = useState("");


  const handleBlockUser = async () => {
    setModalVisible(false);
    setReportMessageModalVisible(false);

    Alert.alert(
      `Block ${petId}?`,
      "Blocking will also hide all their associated pet profiles from you. They won't be notified, and neither you nor they will be able to see each other's posts.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Block User",
          onPress: () => performBlockUser(),
          style: "destructive",
        },
      ],
      { cancelable: false },
    );
  };

  const performBlockUser = async () => {
    try {
      const accessToken = await SecureStorage.getItem("access");
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/userblocking/block/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `JWT ${accessToken}`,
        },
        body: JSON.stringify({ pet_id: petId }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message, [{ text: "OK" }]);
        dispatch(fetchFeed());
        setPostDetails({ accessDenied: true });
      } else {
        Alert.alert("Error", data.error || "Failed to block user", [{ text: "OK" }]);
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while blocking the user. Please try again later.", [{ text: "OK" }]);
    }
    setModalVisible(false);
  };


  const handleReportContent = () => {
    setModalVisible(false);
    setReportModalVisible(true);
  };


  const handleReportReasonSelect = async (reasonCode) => {
    setIsReportSending(true);

    const accessToken = await SecureStorage.getItem("access");
    if (!accessToken) {
      console.error("JWT token not found");
      setIsReportSending(false);
      return;
    }

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/contentreporting/report_post/`, {
        method: "POST",
        headers: {
          "Authorization": `JWT ${accessToken}`,
          "Content-Type": "application/json",
        },
        body:
          JSON.stringify({
            post_id: postId,
            reason: reasonCode,
            details: "",
          }),
      });

      if (response.ok) {
        setReportMessage("Thank you for letting us know!");
        dispatch(fetchFeed());
      } else {
        setReportMessage("Failed to report the post. Please try again.");
      }
    } catch (error) {
      setReportMessage("An error occurred while reporting the post. Please try again.");
    } finally {
      setIsReportSending(false);
      setReportModalVisible(false);
      setReportMessageModalVisible(true);
    }

  };

  const handleCloseReportMessageModal = () => {
    setReportMessageModalVisible(false);
    setReportMessage("");
    setPostDetails({ accessDenied: true });
  };


  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const accessToken = await SecureStorage.getItem("access");
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/mediaposts/post_media/${postId}/full/`, {
          headers: { "Authorization": `JWT ${accessToken}` },
        });
        const data = await response.json();

        if (response.ok) {
          setPostDetails(data);
        } else if (response.status === 403) {
          setPostDetails({ accessDenied: true });
        }
      } catch (error) {
        console.error("Failed to fetch post details", error);
      }
    };

    fetchPostDetails();
  }, [postId]);

  if (!postDetails) {
    return <Text>Loading...</Text>;
  }

  if (postDetails.accessDenied) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ textAlign: "center", margin: 20 }}>
          This content is not available. It might be due to privacy settings of the user.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    // TODO - Refactor slider modal
    // https://soulecho.atlassian.net/browse/PA-242

    <SafeAreaView style={styles.fullScreenContainer}>
      <ScrollView style={styles.scrollViewStyle}>
        <PostSection
          petProfile={{ profile_pic_thumbnail_small: petProfilePic, pet_id: petId }}
          postDetails={postDetails}
          showEllipsis={true}
          onEllipsisPress={() => setModalVisible(!modalVisible)}
          isLiked={isLiked}
          likeCount={likeCount}
          handleLikePress={toggleLike}
        />

        <SliderModal
          dropdownVisible={modalVisible}
          setDropdownVisible={setModalVisible}
        >
          <TouchableOpacity onPress={handleReportContent}>
            <Text style={styles.modalTextRed}>Report Content</Text>
          </TouchableOpacity>
        </SliderModal>


        <SliderModal dropdownVisible={reportModalVisible} setDropdownVisible={setReportModalVisible}>
          {isReportSending ? (
            <View style={styles.activityIndicatorModal}>
              <ActivityIndicator size="large" color="#ffc02c" />
            </View>
          ) : (
            <>
              <View>
                <Text style={styles.modalTitle}>Report Post</Text>
              </View>
              <View>
                <Text style={styles.modalQuestion}>Why are you reporting this post?</Text>
              </View>
              {Object.entries(REPORT_REASONS).map(([code, reason]) => (
                <View style={SliderModalStyles.modalRow} key={code}>
                  <TouchableOpacity onPress={() => handleReportReasonSelect(code)}>
                    <Text style={styles.modalTextReportReasons}>{reason}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </SliderModal>

        <SliderModal
          dropdownVisible={reportMessageModalVisible}
          setDropdownVisible={handleCloseReportMessageModal}
        >

          <View style={styles.reportMessageContent}>
            <Ionicons name="checkmark-circle-outline" size={60} color="#ffc02c" />
            <Text style={styles.reportMessage}>{reportMessage}</Text>
            <TouchableOpacity style={styles.okButton} onPress={handleCloseReportMessageModal}>
              <Text style={styles.okButtonText}>Ok</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.blockUserButton} onPress={handleBlockUser}>
              <Text style={styles.blockUserButtonText}>Block User</Text>
            </TouchableOpacity>
          </View>

        </SliderModal>


      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  postDetailScreenContainer: {
    backgroundColor: "white",
    flex: 1,
  },
  modalTextRed: {
    color: "red",
    fontSize: 18,
    padding: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  modalQuestion: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    padding: 10,
  },
  modalTextReportReasons: {
    color: "black",
    fontSize: 16,
    padding: 10,
  },
  reportMessageContent: {
    alignItems: "center",
    padding: 20,
  },
  reportMessage: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  okButton: {
    backgroundColor: "#ffc02c",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    width: "100%",
    marginBottom: 15,
  },
  okButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  blockUserButton: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ffc02c",
    width: "100%",

  },
  blockUserButtonText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  activityIndicatorModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
});


export default OtherUserPostDetailScreen;
