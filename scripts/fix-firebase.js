const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando o Firebase para compatibilidade com React Native...');

try {
  // Verifica e cria o diretório mocks se ele não existir
  const mocksDir = path.join(process.cwd(), 'src', 'mocks');
  if (!fs.existsSync(mocksDir)) {
    fs.mkdirSync(mocksDir, { recursive: true });
    console.log('✅ Diretório src/mocks criado');
  }

  // Cria o arquivo de mock para o idb
  const mockPath = path.join(mocksDir, 'idbMock.js');
  const mockContent = `// Este arquivo serve como um substituto (mock) para o módulo 'idb'
// que é necessário pelo Firebase, mas não é suportado no React Native

// Exportamos um objeto vazio que será usado quando o Firebase tentar 
// importar o módulo 'idb' durante o bundling
export default {};

// Ou exportamos funções vazias que simulam o comportamento do módulo original
// mas não fazem nada no React Native
export const openDB = () => Promise.resolve(null);
export const deleteDB = () => Promise.resolve();

// Outros métodos necessários podem ser mockados aqui
`;
  fs.writeFileSync(mockPath, mockContent);
  console.log('✅ Arquivo de mock para idb criado');

  // Atualiza o metro.config.js
  const metroConfigPath = path.join(process.cwd(), 'metro.config.js');
  const metroConfig = `// Configuração do Metro Bundler

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuração para resolver problemas com o Firebase e idb
config.resolver.extraNodeModules = {
  // Este é um "mock" para o módulo idb que o Firebase tenta importar
  idb: require.resolve('./src/mocks/idbMock.js'),
};

// Adicionamos as extensões que o Metro deve resolver
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

module.exports = config;`;
  fs.writeFileSync(metroConfigPath, metroConfig);
  console.log('✅ metro.config.js atualizado');

  console.log('\n🚀 Configuração concluída!');
  console.log('\n⚠️ Importante: Certifique-se de instalar o AsyncStorage:');
  console.log('   npm install @react-native-async-storage/async-storage');
  console.log('\n💡 Agora você pode iniciar o aplicativo com:');
  console.log('   npx expo start --clear');

} catch (error) {
  console.error('❌ Erro durante a configuração:', error.message);
  process.exit(1);
}
