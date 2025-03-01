# LazzFit

Aplicativo de fitness e treino usando React Native e Expo.

## Como executar no navegador

Para executar o aplicativo no navegador, primeiro você precisa instalar as dependências web:

```bash
# Execute o script de instalação de dependências
instalar_dependencias_web.bat

# OU execute manualmente:
npx expo install react-dom react-native-web @expo/metro-runtime
```

Depois, inicie o aplicativo no modo web:

```bash
npx expo start --web
```

Ou use o script de inicialização:

```bash
iniciar_web.bat
```

## Solução de problemas

Se você encontrar o erro:

```
It looks like you're trying to use web support but don't have the required dependencies installed.
```

Execute o script `instalar_dependencias_web.bat` para instalar as dependências necessárias.

## Estrutura do projeto

- `/src`: Código fonte do aplicativo
- `/assets`: Imagens e outros recursos
- `/components`: Componentes reutilizáveis
- `/screens`: Telas do aplicativo
- `/navigation`: Configuração de navegação
- `/services`: Serviços (Firebase, localização, etc.)

## Desenvolvimento

Para desenvolvimento completo:

1. Instale as dependências: `npm install`
2. Inicie o servidor Expo: `npx expo start`
3. Execute em um dispositivo/emulador ou no navegador
