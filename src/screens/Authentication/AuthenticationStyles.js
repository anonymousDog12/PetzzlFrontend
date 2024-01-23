import { StyleSheet } from "react-native";


export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f2f2f2",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  welcomeMessage: {
    fontWeight: "bold",
    color: "#3d3d3d",
    fontSize: 23,
    textAlign: "center",
    marginVertical: 20,
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 0,
    marginRight: 10,
    height: 50,
  },
  logo: {
    height: 50,
    width: 150,
    resizeMode: "contain",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 50,
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    height: 50,
  },
  button: {
    backgroundColor: "#ffc02c",
    borderRadius: 50,
    marginVertical: 10,
    height: 50,
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
  },
  footerLink: {
    color: "#797979",
    textDecorationLine: "underline",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  successMessage: {
    color: "green",
    textAlign: "center",
    marginBottom: 10,
  },
  termsContainer: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  termsText: {
    color: "#646464",
    fontSize: 14,
    textAlign: "center",
  },
  termsLink: {
    color: "#797979",
    textDecorationLine: "underline",
  },
});
