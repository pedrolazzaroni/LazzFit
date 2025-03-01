import { Platform } from 'react-native';

/**
 * Utilitário para verificar a compatibilidade do navegador e recursos web
 */

/**
 * Verifica se a aplicação está rodando em ambiente web
 */
export const isWeb = Platform.OS === 'web';

/**
 * Verifica se o JavaScript está habilitado
 * Sempre retorna true no ambiente React, pois se estivesse desabilitado
 * o código nem seria executado.
 */
export const isJavaScriptEnabled = () => {
  return true;
};

/**
 * Verifica se o browser atual é compatível
 */
export const isCompatibleBrowser = () => {
  if (!isWeb) return true;
  
  // Verifica recursos essenciais do navegador
  const features = [
    typeof window !== 'undefined',
    typeof document !== 'undefined',
    typeof fetch !== 'undefined',
    typeof localStorage !== 'undefined',
    typeof sessionStorage !== 'undefined',
  ];
  
  return features.every(feature => feature === true);
};

/**
 * Obtém informações sobre o navegador atual
 */
export const getBrowserInfo = () => {
  if (!isWeb) return { name: 'Not a browser', version: 'N/A' };
  
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  // Detecta nome e versão do navegador
  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = 'Chrome';
  } else if (userAgent.match(/firefox|fxios/i)) {
    browserName = 'Firefox';
  } else if (userAgent.match(/safari/i)) {
    browserName = 'Safari';
  } else if (userAgent.match(/opr\//i)) {
    browserName = 'Opera';
  } else if (userAgent.match(/edg/i)) {
    browserName = 'Edge';
  } else if (userAgent.match(/android/i)) {
    browserName = 'Android Browser';
  } else if (userAgent.match(/iphone|ipad/i)) {
    browserName = 'iOS Browser';
  }
  
  // Extrai versão (lógica simplificada)
  const versionMatch = userAgent.match(/(chrome|firefox|safari|opr|edg|msie|rv)[/: ]([0-9.]+)/i);
  if (versionMatch) {
    browserVersion = versionMatch[2];
  }
  
  return { name: browserName, version: browserVersion };
};

/**
 * Verifica se localStorage está disponível e funcionando
 */
export const isLocalStorageAvailable = () => {
  if (!isWeb) return false;
  
  const testKey = '__test_storage__';
  try {
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Verifica se o aplicativo está sendo executado em um webview mobile
 */
export const isRunningInWebView = () => {
  if (!isWeb) return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const standalone = 'standalone' in navigator;
  
  // Detecta webview em Android
  const isAndroidWebView = /wv/.test(userAgent) || /android.*Version\/[0-9]/.test(userAgent);
  
  // Detecta webview em iOS
  const isIOSWebView = !standalone && /iphone|ipod|ipad/.test(userAgent) && !userAgent.includes('safari');
  
  return isAndroidWebView || isIOSWebView;
};
