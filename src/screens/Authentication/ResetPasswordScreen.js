import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import images from "../../assets/assets";
import { reset_password } from "../../redux/actions/auth";
import { checkEmailExists } from "../../utils/auth";
import { authStyles } from "./AuthenticationStyles";


export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const dispatch = useDispatch();

  const handleDismissError = () => {
    setErrorMessage(null);
  };

  const handleResetPassword = async () => {
    const emailExists = await checkEmailExists(email);
    if (emailExists === true) {
      console.log("Email exists, resetting password....");
      await dispatch(reset_password(email));
      setSuccessMessage("Please check your email for a link to reset your password");
    } else if (emailExists === false) {
      setErrorMessage("Oops, we couldn't find an account associated with this email. Please check and try again.");
    } else if (emailExists === "error") {
      setErrorMessage("Something went wrong, please contact admin@petzzl.app");
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
        {successMessage && <Text style={authStyles.successMessage}>{successMessage}</Text>}
        {errorMessage && <Text style={authStyles.error}>{errorMessage}</Text>}
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
        <TouchableOpacity onPress={handleResetPassword} style={authStyles.button}>
          <Text style={authStyles.buttonText}>Reset Password</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
