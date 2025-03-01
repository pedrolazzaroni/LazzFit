import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../theme/colors';

export default function Button({ 
  title, 
  onPress, 
  type = 'primary', 
  fullWidth = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props 
}) {
  const buttonStyles = [
    styles.button,
    type === 'primary' && styles.primaryButton,
    type === 'secondary' && styles.secondaryButton,
    type === 'outline' && styles.outlineButton,
    type === 'text' && styles.textButton,
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabledButton,
    style
  ];
  
  const textStyles = [
    styles.text,
    type === 'primary' && styles.primaryText,
    type === 'secondary' && styles.secondaryText,
    type === 'outline' && styles.outlineText,
    type === 'text' && styles.textOnlyText,
    (disabled || loading) && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity 
      style={buttonStyles} 
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={type === 'primary' ? Colors.white : Colors.primary} 
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
    elevation: 2,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 0,
  },
  fullWidth: {
    width: '100%',
  },
  disabledButton: {
    opacity: 0.6,
    elevation: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.white,
  },
  outlineText: {
    color: Colors.primary,
  },
  textOnlyText: {
    color: Colors.primary,
  },
  disabledText: {
    color: Colors.grey500,
  },
});
