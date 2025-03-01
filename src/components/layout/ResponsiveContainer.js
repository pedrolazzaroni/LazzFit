import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { isDesktopWeb } from '../../utils/platform';
import { Colors } from '../../theme/colors';

/**
 * Componente de contêiner que adapta o layout para diferentes tamanhos de tela
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Conteúdo do contêiner
 * @param {Object} props.style - Estilo adicional para o contêiner
 * @param {'full'|'medium'|'small'} props.width - Largura máxima do contêiner (small=800px, medium=1200px, full=100%)
 * @param {boolean} props.center - Se o conteúdo deve ser centralizado horizontalmente
 * @param {boolean} props.card - Se o contêiner deve ter aparência de cartão
 */
export default function ResponsiveContainer({ 
  children, 
  style, 
  width = 'medium', 
  center = true,
  card = false
}) {
  const { width: screenWidth } = useWindowDimensions();
  const isDesktop = isDesktopWeb();
  
  // Define largura máxima baseada no parâmetro width
  const getMaxWidth = () => {
    if (width === 'small') return 800;
    if (width === 'medium') return 1200;
    return '100%';
  };
  
  // Estilo dinâmico do contêiner baseado nos props
  const containerStyle = [
    styles.container,
    center && styles.centered,
    {
      maxWidth: getMaxWidth(),
      width: '100%',
      padding: isDesktop ? 24 : 16,
    },
    card && [styles.card, { padding: isDesktop ? 32 : 16 }],
    style
  ];
  
  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignSelf: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  }
});
