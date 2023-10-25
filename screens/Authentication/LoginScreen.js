import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch } from "react-redux";
import { login } from "../../redux/actions/auth";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  const handleLogin = async () => {
    console.log('handling log in');
    let errorResponse = await dispatch(login(email, password));
    if (errorResponse) {
      console.log(errorResponse);
    } else {
      console.log('login success!')
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.footer}>
        Don't have an account yet? &nbsp;
        <Text style={styles.footerLink} onPress={() => navigation.navigate('SignUp')}>
          Sign Up
        </Text>
      </Text>
      <Text style={styles.footer}>
        Forgot Password? &nbsp;
        <Text style={styles.footerLink}>
          Reset
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
});
