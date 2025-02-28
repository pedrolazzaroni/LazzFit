import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';

const CustomButton = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  isLoading = false,
  disabled = false,
  color = '#4CAF50'
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button, 
        { backgroundColor: color }, 
        disabled && styles.disabledButton,
        style
      ]}
      onPress={onPress}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default CustomButton;
