import { StyleSheet } from "react-native";


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedPetName: {
    fontWeight: "bold",
  },
  dropdownButton: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffc02c",
  },
  dropdownContainer: {
    position: "absolute",
    top: 50,
    left: 10,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    padding: 10,
  },
  sliderContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  sliderHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginTop: 1,
    marginBottom: 15,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 10,
  },
  cameraIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#A9A9A9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  actionSheetBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  actionSheet: {
    backgroundColor: "white",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  actionSheetButton: {
    padding: 16,
    alignItems: "center",
  },
  actionSheetText: {
    fontSize: 18,
    color: "#ffc02c",
  },
  postItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 2,
  },
  postThumbnail: {
    width: "100%",
    height: "100%",
  },
  addNewPetButton: {
    padding: 10,
    alignItems: "center",
  },
  addNewPetText: {
    color: "#ffc02c",
    fontSize: 16,
  },
  fullScreenButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  petProfile: {
    flexDirection: "row",
    padding: 10,
    marginVertical: 8,
    backgroundColor: "lightgrey",
    borderRadius: 5,
    alignItems: "center",
    height: 120,
  },
  profilePicContainer: {
    marginRight: 10,
  },
  petInfo: {
    flex: 1, // Take the remaining space
  },
  petId: {
    fontSize: 18,
    fontWeight: "bold",
  },
  petName: {
    fontSize: 16,
  },
  petType: {
    fontSize: 15,
  },
  modalTextRed: {
    color: "red",
    fontSize: 18,
    padding: 10,
  },
});

export default styles;
