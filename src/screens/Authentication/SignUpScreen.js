import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import { login, signup } from "../../redux/actions/auth";
import { extractErrorMessages } from "../../utils/auth";


export default function SignUpScreen({ navigation }) {
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      <TextInput
        placeholder="First Name"
        value={firstName}
        onChangeText={(text) => {
          setFirstName(text);
          handleDismissError();
        }}
        onFocus={handleDismissError}
        style={styles.input}
      />
      <TextInput
        placeholder="Last Name"
        value={lastName}
        onChangeText={(text) => {
          setLastName(text);
          handleDismissError();
        }}
        onFocus={handleDismissError}
        style={styles.input}
      />
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
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          handleDismissError();
        }}
        secureTextEntry
        onFocus={handleDismissError}
        style={styles.input}
      />

      <TouchableOpacity onPress={handleSignUp} style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <Text style={styles.footer}>
        Already have an account? &nbsp;
        <Text style={styles.footerLink} onPress={() => navigation.navigate("Login")}>
          Login
        </Text>
      </Text>
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
  footer: {
    marginTop: 20,
    textAlign: "center",
  },
  footerLink: {
    color: "#007BFF",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});
