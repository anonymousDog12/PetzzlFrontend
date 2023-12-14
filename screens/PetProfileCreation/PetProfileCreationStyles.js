import { StyleSheet } from "react-native";

export const PetProfileCreationStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "gray",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: '80%',
    marginTop: 10,
    padding: 10,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
  dropdownContainer: {
    height: 40,
    width: '80%',
    marginBottom: 20,
  },
  dropdown: {
    backgroundColor: "#fafafa",
  },
  itemStyle: {
    justifyContent: "flex-start",
  },
  dropdownStyle: {
    backgroundColor: "#fafafa",
  },
});

export default PetProfileCreationStyles;
