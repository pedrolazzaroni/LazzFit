# Executando o LazzFit no Navegador

Este guia explica como executar o aplicativo LazzFit (versão JavaScript/React Native) diretamente no navegador para testes.

## Pré-requisitos

- Node.js instalado (versão 14 ou superior)
- NPM ou Yarn instalado
- Navegador moderno (Chrome, Edge, Firefox)

## Método Simples (Script Automático)

1. No diretório raiz do projeto, execute o script:
   ```
   iniciar_web.bat
   ```

2. Aguarde até que o Expo inicie e abra seu navegador

3. Se o navegador não abrir automaticamente na página do app:
   - Acesse o link exibido no terminal (geralmente http://localhost:19006)
   - Ou adicione "/web" ao final da URL do Expo DevTools

## Executando Manualmente

Se preferir executar manualmente:

1. Abra um terminal no diretório do projeto

2. Instale as dependências (caso ainda não tenha feito):
   ```
   npm install
   ```

3. Inicie o app no modo web:
   ```
   npx expo start --web
   ```

## Solução de Problemas

Se encontrar algum problema:

### Porta já em uso
```
error: Port 19000 already in use
```

Execute:
```
npx kill-port 19000 19001 19002 19006
```
E tente novamente.

### Módulos não encontrados
```
Error: Cannot find module...
```

Execute:
```
npm install
```
E tente novamente.

### Navegador não abre automaticamente

Se o navegador não abrir automaticamente, acesse manualmente:
```
http://localhost:19006
```

### Problemas com Expo

Se o Expo não iniciar corretamente:
```
npm cache clean --force
npm install -g expo-cli
npm install
npx expo start --web
```

## Testando no dispositivo móvel com JavaScript

Para testar no dispositivo móvel usando o código JavaScript original (não Flutter):

1. Instale o app "Expo Go" no seu dispositivo Android/iOS
2. Execute `npx expo start` (sem a flag --web)
3. Escaneie o QR code com o app Expo Go
