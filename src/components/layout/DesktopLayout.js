import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../theme/colors';
import { isDesktopWeb } from '../../utils/platform';

/**
 * Componente que adapta o layout para versão desktop
 * Centraliza o conteúdo com largura máxima quando em desktop
 */
export default function DesktopLayout({ children, style }) {
  // Se não for web desktop, apenas renderiza o conteúdo normalmente
  if (!isDesktopWeb()) {
    return children;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.content, style]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.grey100,
    width: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 1200, // Largura máxima para desktop
    backgroundColor: Colors.white,
    ...Platform.select({
      web: {
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  }
});
