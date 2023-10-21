import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

export default function Authentication() {
  return (
    <View style={styles.container}>

      <Text style={styles.heading}>Join the Petzzl Family</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Join now</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.appleButton}>
        <Text style={styles.buttonText}>Continue with Apple</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleButton}>
        <Text style={[styles.buttonText, styles.googleText]}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.signInText}>Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 40,
  },
  heading: {
    fontSize: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#0077B5',  // LinkedIn Blue
    padding: 10,
    width: '80%',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Added to center the text
    backgroundColor: '#000',  // Black
    padding: 10,
    width: '80%',
    borderRadius: 5,
    marginBottom: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Added to center the text
    backgroundColor: '#fff',
    padding: 10,
    width: '80%',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  googleText: {
    color: '#000', // Google Text color
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  signInText: {
    color: '#0077B5',  // LinkedIn Blue
    fontSize: 16,
  },
});
