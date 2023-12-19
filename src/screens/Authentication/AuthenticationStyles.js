import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f2f2f2', // Set to light grey background
  },
  input: {
    backgroundColor: '#ffffff', // White background color
    borderWidth: 1, // Define border width
    borderColor: '#cccccc', // Light grey border color
    borderRadius: 50, // Rounded look
    marginBottom: 15,
    paddingHorizontal: 12, // Only horizontal padding affects width
    paddingVertical: 12, // Padding top and bottom
    fontSize: 16,
    height: 50, // Set fixed height for inputs
  },
  button: {
    backgroundColor: '#ffc02c', // Set button background to the specified orange
    borderRadius: 50, // Match border radius with inputs for consistency
    marginVertical: 10, // Add vertical margin for spacing
    height: 50, // Match the height with inputs
    justifyContent: 'center', // Center the text vertically
  },
  buttonText: {
    color: '#ffffff', // White text color for the button
    textAlign: 'center',
    fontWeight: 'bold', // Make the text bold
    fontSize: 18, // Increase font size for better readability
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
  },
  footerLink: {
    color: '#007BFF', // Keep the link color as it is
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});
