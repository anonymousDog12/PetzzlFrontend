import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    // Placeholder logic for resetting password
    console.log('Handle reset password logic here');
    console.log(`Resetting password for email: ${email}`);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TouchableOpacity onPress={handleResetPassword} style={styles.button}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
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
