import { StyleSheet } from "react-native";

const colors = {
  logo_grey: "#3d3d3d",
  logo_yellow: "#ffc02c",
  grey: "#797979",
  lightGray: "#fafafa",
};

export const PetProfileCreationStyles = StyleSheet.create({

  // Common
  cancelButton: {
    color: "#797979",
    fontSize: 30,
    marginLeft: 10,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },

  // Regular color scheme
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.logo_yellow,
  },
  mainTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: colors.lightGray,
  },
  subTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: colors.lightGray,
  },
  itemStyle: {
    justifyContent: "flex-start",
  },

  button: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 50,
    width: '50%',
  },
  buttonText: {
    color: colors.logo_grey,
    fontSize: 18,
    textAlign: "center",
  },

  // Reverse color scheme
  containerReverse: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.lightGray,
  },
  mainTitleReverse: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: colors.logo_yellow,
  },
  subTitleReverse: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: colors.logo_grey,
  },
  buttonReverse: {
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 40,
    borderRadius: 50,
    width: '50%',
  },
  buttonTextReverse: {
    color: colors.lightGray,
    fontSize: 18,
    textAlign: "center",
  },
  dropdownContainer: {
    height: 45,
    width: '80%',
  },
  dropdown: {
    backgroundColor: "#ffffff",
    borderColor: "#cccccc",
    borderRadius: 5,
  },

  input: {
    height: 45,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 5,
    width: '80%',
    marginTop: 10,
    padding: 10,
  },
});

export default PetProfileCreationStyles;
