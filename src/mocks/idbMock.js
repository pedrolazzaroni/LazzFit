// Este arquivo serve como um substituto (mock) para o módulo 'idb'
// que é necessário pelo Firebase, mas não é suportado no React Native

// Exportamos um objeto vazio que será usado quando o Firebase tentar 
// importar o módulo 'idb' durante o bundling
export default {};

// Ou exportamos funções vazias que simulam o comportamento do módulo original
// mas não fazem nada no React Native
export const openDB = () => Promise.resolve(null);
export const deleteDB = () => Promise.resolve();

// Outros métodos necessários podem ser mockados aqui
