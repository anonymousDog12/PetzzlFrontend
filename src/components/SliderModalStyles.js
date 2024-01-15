import { StyleSheet } from "react-native";


const colors = {
  logo_grey: "#3d3d3d",
  logo_yellow: "#ffc02c",
  grey: "#797979",
  lightGray: "#fafafa",
};

export const SliderModalStyles = StyleSheet.create({
  fullScreenButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  sliderContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
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
  defaultTextStyle: {
    textAlign: "left",
    width: "100%",
  },
  modalRow: {
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
    paddingVertical: 10,
  },
  modalOuterRow: {
    width: "100%",
  }
});

export default SliderModalStyles;
