import { StyleSheet } from "react-native";

const colors = {
  logo_grey: "#3d3d3d",
  logo_yellow: "#ffc02c",
  lightGray: "#fafafa",
};

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
    color: colors.gray,
  },
  input: {
    height: 40,
    borderColor: colors.gray,
    borderWidth: 1,
    width: '80%',
    marginTop: 10,
    padding: 10,
  },
  errorText: {
    color: colors.red,
    marginTop: 10,
  },
  dropdownContainer: {
    height: 40,
    width: '80%',
    marginBottom: 20,
  },
  dropdown: {
    backgroundColor: colors.lightGray,
  },
  itemStyle: {
    justifyContent: "flex-start",
  },
  dropdownStyle: {
    backgroundColor: colors.lightGray,
  },
});

export default PetProfileCreationStyles;
