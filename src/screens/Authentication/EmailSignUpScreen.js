import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import images from "../../assets/assets";
import { login, signup } from "../../redux/actions/auth";
import { extractErrorMessages } from "../../utils/auth";
import { authStyles } from "./AuthenticationStyles";


const welcomeMessage = "Welcome to Petzzl! 🐾";


export default function EmailSignUpScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);


  const dispatch = useDispatch();

  const handleDismissError = () => {
    setErrorMessage(null);
  };

  const handleSignUp = async () => {

    let errorResponse = await dispatch(signup(firstName, lastName, email, password, password));
    if (errorResponse) {
      console.log(errorResponse);
      setErrorMessage("Sign-up failed: " + extractErrorMessages(errorResponse));
    } else {
      console.log("sign up success! logging in...");
      let loginResponse = await dispatch(login(email, password));
      if (loginResponse) {
        let customErrorMsg = "Error proceeding; please contact admin@petzzl.app";
        setErrorMessage(customErrorMsg);
        console.log(loginResponse);
      } else {
        console.log("login in successful");
      }
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
        <Text style={authStyles.welcomeMessage}>{welcomeMessage}</Text>
        {errorMessage && <Text style={authStyles.error}>{errorMessage}</Text>}
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            handleDismissError();
          }}
          onFocus={handleDismissError}
          style={authStyles.input}
        />
        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            handleDismissError();
          }}
          onFocus={handleDismissError}
          style={authStyles.input}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            handleDismissError();
          }}
          onFocus={handleDismissError}
          style={authStyles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            handleDismissError();
          }}
          secureTextEntry
          onFocus={handleDismissError}
          style={authStyles.input}
        />

        <TouchableOpacity onPress={handleSignUp} style={authStyles.button}>
          <Text style={authStyles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={authStyles.footer}>
          Already have an account? &nbsp;
          <Text style={authStyles.footerLink} onPress={() => navigation.navigate("Login")}>
            Login
          </Text>
        </Text>

        <View style={authStyles.termsContainer}>
          <Text style={authStyles.termsText}>
            By signing up, you agree to our&nbsp;
            <Text
              style={authStyles.termsLink}
              onPress={() => Linking.openURL("https://petzzl.app/terms-of-service")}>
              Terms of Service
            </Text>.
          </Text>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
