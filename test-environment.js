
const testConfig = {
  enableMockLocation: true,
  debugMode: true,
  logLevel: 'verbose',
  mockRoutes: [
    {
      name: 'Caminhada no parque',
      points: [
        { latitude: -23.5505, longitude: -46.6333, timestamp: Date.now() },
        { latitude: -23.5506, longitude: -46.6335, timestamp: Date.now() + 30000 },
        // Adicione mais pontos conforme necessário
      ]
    }
  ]
};

export default testConfig;
