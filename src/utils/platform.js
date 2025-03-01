import { Platform, Dimensions } from 'react-native';

// Detecta se está rodando em ambiente desktop (web em tela grande)
export const isDesktopWeb = () => {
  return Platform.OS === 'web' && Dimensions.get('window').width >= 768;
};

// Detecta se está rodando em tablet
export const isTablet = () => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = width / height;
  return Platform.OS === 'web' 
    ? width >= 768 && width < 1200
    : (
        (Platform.OS === 'ios' && aspectRatio > 1.6) || 
        (Platform.OS === 'android' && aspectRatio > 1.6)
      );
};

// Detecta se está rodando no modo paisagem
export const isLandscape = () => {
  const { width, height } = Dimensions.get('window');
  return width > height;
};

// Retorna valores adaptados para diferentes plataformas
export const platformValue = (options) => {
  const { web, ios, android, default: defaultValue } = options;
  
  if (Platform.OS === 'web' && web !== undefined) return web;
  if (Platform.OS === 'ios' && ios !== undefined) return ios;
  if (Platform.OS === 'android' && android !== undefined) return android;
  
  return defaultValue;
};

// Retorna valores adaptados para desktop ou mobile
export const responsiveValue = (options) => {
  const { desktop, mobile, default: defaultValue } = options;
  
  if (isDesktopWeb() && desktop !== undefined) return desktop;
  if (!isDesktopWeb() && mobile !== undefined) return mobile;
  
  return defaultValue;
};

// Calcula tamanhos responsivos baseados em porcentagem da tela
export const responsiveSize = (percentage) => {
  const { width } = Dimensions.get('window');
  return Math.round(width * (percentage / 100));
};
