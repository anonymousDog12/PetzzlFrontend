import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import SecureStorage from "react-native-secure-storage";
import { CONFIG } from "../config";

const LikerListScreen = ({ route }) => {
  const { postId } = route.params;
  console.log(postId)
  const [likers, setLikers] = useState([]);


  useEffect(() => {
    const fetchLikers = async () => {
      try {
        const accessToken = await SecureStorage.getItem("access");
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/postreactions/posts/${postId}/likers/`, {
          headers: {
            "Authorization": `JWT ${accessToken}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setLikers(data.likers);
        } else {
          console.error('Error fetching likers:', data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchLikers();
  }, [postId]);

  console.log(likers)


  const renderLiker = ({ item }) => {
    return (
      <View style={styles.likerContainer}>
        <Image source={{ uri: item.pet_profile__profile_pic_thumbnail_small }} style={styles.profilePic} />
        <Text style={styles.likerName}>{item.pet_profile__pet_id}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={likers}
        renderItem={renderLiker}
        keyExtractor={item => item.pet_id ? item.pet_id.toString() : Math.random().toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  likerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  likerName: {
    fontSize: 16,
  },
});

export default LikerListScreen;
