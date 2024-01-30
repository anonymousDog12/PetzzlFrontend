import appleAuth from "@invertase/react-native-apple-authentication";
import React from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import images from "../../assets/assets";
import { appleSignIn } from "../../redux/actions/auth";
import { authStyles } from "./AuthenticationStyles";


export default function SignUpOptionsScreen({ navigation }) {

  const dispatch = useDispatch();

  const handleAppleSignIn = async () => {
    try {
      if (appleAuth.isSupported) {
        const appleAuthResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });

        const { identityToken, fullName } = appleAuthResponse;
        const firstName = fullName?.givenName;
        const lastName = fullName?.familyName;

        dispatch(appleSignIn(identityToken, firstName, lastName));
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to sign in with Apple. Please try again.");
    }
  };


  return (
    <SafeAreaView style={authStyles.safeArea}>
      <View style={authStyles.logoContainer}>
        <Image source={images.pawPrintLogo} style={authStyles.logo} />
      </View>
      <KeyboardAvoidingView
        style={authStyles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <Text style={authStyles.welcomeMessage}>Welcome to DogDomain! 🐾</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("SignUp")}
          style={authStyles.button}
        >
          <Text style={authStyles.buttonText}>Sign Up with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAppleSignIn}
          style={authStyles.socialButton}
        >
          <Ionicons name="logo-apple" style={authStyles.icon} />
          <Text style={authStyles.darkButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        <Text style={authStyles.footer}>
          Already have an account? &nbsp;
          <Text
            style={authStyles.footerLink}
            onPress={() => navigation.navigate("Login")}
          >
            Login
          </Text>
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
