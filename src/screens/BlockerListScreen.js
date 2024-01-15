import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SecureStorage from "react-native-secure-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { CONFIG } from "../../config";
import { DEFAULT_PROFILE_PICS, PET_TYPES } from "../data/AppContants";
import { fetchFeed } from "../redux/actions/feed";


const BlockerListScreen = ({ navigation }) => {
  const [blockedProfiles, setBlockedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [refreshing, setRefreshing] = useState(false);

  const [isUnblockingOverlay, setIsUnblockingOverlay] = useState(false);

  const dispatch = useDispatch();

  const getProfilePic = (profilePic, petType) => {
    return profilePic || DEFAULT_PROFILE_PICS[petType] || DEFAULT_PROFILE_PICS[PET_TYPES.OTHER];
  };

  const fetchBlockedProfiles = useCallback(async () => {
    try {
      const accessToken = await SecureStorage.getItem("access");
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/userblocking/blocked_profiles/`, {
        headers: {
          "Authorization": `JWT ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch blocked profiles");
        setError("Failed to fetch blocked profiles");
        return;
      }

      const data = await response.json();
      setBlockedProfiles(data);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchBlockedProfiles();
  }, [fetchBlockedProfiles]);

  const confirmUnblock = (petId) => {
    Alert.alert(
      "Unblock User",
      `This will unblock ${petId} and all associated profiles. They will be able to see your posts and interact with you on the feed. Do you want to continue?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Unblock", onPress: () => unblockProfile(petId), style: "destructive" },
      ],
    );
  };

  const unblockProfile = async (petId) => {
    setIsUnblockingOverlay(true);
    try {
      const accessToken = await SecureStorage.getItem("access");
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/userblocking/unblock/`, {
        method: "POST",
        headers: {
          "Authorization": `JWT ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pet_id: petId }),
      });

      if (response.ok) {
        console.log(`Unblocked profile with pet_id: ${petId}`);
        setRefreshing(!refreshing);
        dispatch(fetchFeed());
      } else {
        console.error("Failed to unblock profile");
        Alert.alert(
          "Unblock Error",
          "An error occurred while trying to unblock the profile. Please try again later.",
          [{ text: "OK" }],
        );
      }
    } catch (err) {
      console.error(err.message);
      Alert.alert(
        "Unblock Error",
        "An error occurred while trying to unblock the profile. Please try again later.",
        [{ text: "OK" }],
      );
    } finally {
      setIsUnblockingOverlay(false);
    }
  };


  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>An error occurred: {error}</Text>
        <Button title="Retry" onPress={fetchBlockedProfiles} />
      </View>
    );
  }

  const renderEmptyListMessage = () => {
    return (
      <View style={styles.emptyListContainer}>
        <Ionicons name="checkmark-done-outline" size={50} color="#797979" />
        <Text style={styles.emptyListText}>All clear! No blocked profiles.</Text>
      </View>
    );
  };

  const renderBlockedProfile = ({ item }) => (
    <View style={styles.blockedItem}>
      <Image source={{ uri: getProfilePic(item.profile_pic_thumbnail_small, item.pet_type) }}
             style={styles.profilePic} />
      <View style={styles.profileInfo}>
        <Text style={styles.petIdBold}>{item.pet_id}</Text>
        <Text style={styles.associatedText}>and associated profiles</Text>
      </View>
      <TouchableOpacity onPress={() => confirmUnblock(item.pet_id)}>
        <Text style={styles.unblockButtonText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {isUnblockingOverlay && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#ffc02c" />
        </View>
      )}
      <FlatList
        data={blockedProfiles}
        keyExtractor={(item) => item.pet_id.toString()}
        renderItem={renderBlockedProfile}
        ListEmptyComponent={renderEmptyListMessage}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  profileInfo: {
    flex: 1,
  },
  unblockButtonText: {
    fontSize: 16,
    color: "white",
    backgroundColor: "#ffc02c",
    fontWeight: "bold",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  list: {
    width: "100%",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  petIdBold: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  associatedText: {
    fontSize: 14,
    color: "grey",
  },
  blockedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
    backgroundColor: "white",
    paddingHorizontal: 10,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  petName: {
    fontSize: 18,
    color: "black",
    flex: 1,
  },
  overlay: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 18,
    color: "#797979",
    marginTop: 10,
  },
});

export default BlockerListScreen;
