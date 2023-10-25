import React, { useState } from 'react';
import { useDispatch} from 'react-redux';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { login, signup } from "../../redux/actions/auth";

export default function SignUpScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);


  const dispatch = useDispatch();

  const handleDismissError = () => {
    setErrorMessage(null);
  };

  const handleSignUp = async () => {
    console.log('+++++++++')
    console.log("handling signup");
    let errorResponse = await dispatch(signup(firstName, lastName, email, password, password));
    if (errorResponse) {
      console.log("************");
      console.log(errorResponse);
      setErrorMessage("Your error message here"); // <-- Set the error message based on your response
    }
    else {
      console.log('sign up success!!!!! logging in...')
      let loginResponse = await dispatch(login(email, password));
      if (loginResponse) {
        console.log(loginResponse);
      } else {
        console.log('login in successful')
      }

    }
  };


  return (
    <View style={styles.container}>
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
        <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
          Login
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    padding: 8,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
  },
  footerLink: {
    color: '#007BFF',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});
