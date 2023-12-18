import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import { reset_password } from "../../redux/actions/auth";
import { checkEmailExists } from "../../utils/auth";


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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          handleDismissError();
        }}
        onFocus={handleDismissError}
        style={styles.input}
      />
      <TouchableOpacity onPress={handleResetPassword} style={styles.button}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    padding: 8,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
  successMessage: {
    color: "green",
    textAlign: "center",
    marginBottom: 10,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});
