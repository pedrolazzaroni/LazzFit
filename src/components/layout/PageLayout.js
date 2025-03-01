import React from 'react';
import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { isDesktopWeb } from '../../utils/platform';
import ResponsiveContainer from './ResponsiveContainer';

/**
 * Layout de página padrão que adapta o conteúdo para desktop e mobile
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Conteúdo da página
 * @param {Object} props.style - Estilos adicionais
 * @param {boolean} props.scrollable - Se o conteúdo deve ser rolável
 * @param {boolean} props.padded - Se o conteúdo deve ter padding interno
 * @param {string} props.backgroundColor - Cor de fundo da página
 * @param {'small'|'medium'|'full'} props.width - Largura máxima para desktop
 * @param {React.ReactNode} props.header - Componente de cabeçalho personalizado
 * @param {React.ReactNode} props.footer - Componente de rodapé personalizado
 */
export default function PageLayout({
  children,
  style,
  scrollable = true,
  padded = true,
  backgroundColor = Colors.grey100,
  width = 'medium',
  header,
  footer
}) {
  const isDesktop = isDesktopWeb();
  
  // Componente de conteúdo, que pode ser rolável ou não
  const Content = () => (
    <View style={[
      styles.contentContainer,
      padded && styles.paddedContent,
      style
    ]}>
      {children}
    </View>
  );

  // Contêiner principal com segurança para áreas do sistema
  return (
    <SafeAreaView 
      style={[
        styles.safeArea, 
        { backgroundColor }
      ]}
      edges={['top', 'left', 'right']}
    >
      {/* Cabeçalho opcional */}
      {header && (
        <View style={styles.headerContainer}>
          {isDesktop ? (
            <ResponsiveContainer width={width} style={styles.headerContent}>
              {header}
            </ResponsiveContainer>
          ) : header}
        </View>
      )}
      
      {/* Conteúdo principal */}
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={isDesktop && styles.scrollViewContent}
          showsVerticalScrollIndicator={Platform.OS !== 'web'}
        >
          {isDesktop ? (
            <ResponsiveContainer width={width}>
              <Content />
            </ResponsiveContainer>
          ) : (
            <Content />
          )}
        </ScrollView>
      ) : (
        isDesktop ? (
          <ResponsiveContainer width={width} style={styles.flex}>
            <Content />
          </ResponsiveContainer>
        ) : (
          <Content />
        )
      )}
      
      {/* Rodapé opcional */}
      {footer && (
        <View style={styles.footerContainer}>
          {isDesktop ? (
            <ResponsiveContainer width={width} style={styles.footerContent}>
              {footer}
            </ResponsiveContainer>
          ) : footer}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  headerContainer: {
    width: '100%',
    zIndex: 10,
  },
  headerContent: {
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
  },
  paddedContent: {
    padding: 16,
  },
  footerContainer: {
    width: '100%',
    zIndex: 10,
  },
  footerContent: {
    padding: 0,
  },
});
