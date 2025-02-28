# Guia de Compatibilidade entre Expo Go e SDK do Projeto

## O Problema de Compatibilidade

O Expo Go instalado em seu dispositivo é compatível apenas com aplicativos que usam a mesma versão SDK ou versão próxima. O erro que você está enfrentando ocorre porque:

- **Seu projeto usa**: SDK Expo 49
- **Seu Expo Go usa**: SDK Expo 52

## Soluções Possíveis

### 1. Usar uma versão mais antiga do Expo Go

Você pode baixar e instalar versões anteriores do Expo Go que são compatíveis com SDK 49:

- **Android**: Baixe o APK da versão Expo Go 2.29.x (SDK 49) em sites como APKPure ou APKMirror
- **iOS**: Infelizmente, a App Store não permite instalar versões antigas. A única opção seria construir e instalar o aplicativo a partir do código fonte

### 2. Atualizar seu projeto para SDK 52

Este é o caminho recomendado a longo prazo:

```
npm run upgrade-sdk
```

Depois de atualizar, execute:

```
npm run device
```

### 3. Usar o Expo Dev Build

Se você precisa manter seu projeto no SDK 49 por algum motivo, pode criar um build de desenvolvimento personalizado:

1. Instale as dependências necessárias:
   ```
   npm install expo-dev-client
   ```

2. Crie um build de desenvolvimento:
   ```
   npx expo prebuild
   npx expo run:android (ou run:ios para dispositivos iOS)
   ```

### 4. Usar o modo de desenvolvimento web temporariamente

Para testes rápidos de interface (sem acesso a recursos nativos como GPS):

```
npm run web
```

## Versões Compatíveis de SDK e Expo Go

| SDK do Projeto | Versões Compatíveis do Expo Go |
|----------------|--------------------------------|
| SDK 52         | Expo Go 2.32.x                 |
| SDK 51         | Expo Go 2.31.x                 |
| SDK 50         | Expo Go 2.30.x                 |
| SDK 49         | Expo Go 2.29.x                 |
| SDK 48         | Expo Go 2.28.x                 |

## Links Úteis

- [Documentação de Compatibilidade do Expo](https://docs.expo.dev/workflow/expo-go/)
- [Download de APKs do Expo Go](https://apkpure.com/expo-go/host.exp.exponent/versions)
- [Versionamento do Expo SDK](https://docs.expo.dev/versions/latest/)
