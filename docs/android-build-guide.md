# Guia para Build Android do LazzFit

Este guia irá ajudá-lo a resolver o problema de CRC (Cyclic Redundancy Check) durante a geração do build Android.

## Problema: Erro de CRC com Ícones

O erro que você está enfrentando está relacionado com o processamento de imagens durante o prebuild do Android. A ferramenta `jimp` que o Expo usa para processar imagens está encontrando um erro de CRC nos ícones gerados.

## Solução: Criar Ícones Manualmente

### 1. Crie ícones PNG simples

Você precisa criar manualmente os seguintes arquivos na pasta `assets`:

- `icon.png` (1024x1024px)
- `splash.png` (1024x1024px)
- `adaptive-icon.png` (1024x1024px)
- `favicon.png` (192x192px)

Você pode usar qualquer editor de imagem (Photoshop, GIMP, Paint.NET, etc.) ou criar um PNG simples online.

Aqui está um exemplo simples:
1. Use um site como [Canva](https://www.canva.com/) ou [Figma](https://www.figma.com/)
2. Crie um quadrado verde (#2E7D32) com a letra "L" em branco
3. Exporte como PNG no tamanho adequado

### 2. Verifique se os arquivos PNG são válidos

Certifique-se de que os arquivos PNG não estejam corrompidos:
- Abra-os em um visualizador de imagens para confirmar
- Verifique se o tamanho do arquivo faz sentido (normalmente entre 5KB e 100KB para ícones simples)

### 3. Atualize o app.json manualmente

```json
{
  "expo": {
    "name": "LazzFit",
    "slug": "lazzfit",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2E7D32"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.lazzfit.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#2E7D32"
      },
      "package": "com.lazzfit.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### 4. Tente o build novamente

Execute o comando:

```
npx expo run:android
```

## Alternativa: Use o Expo Go para Testes

Se você só precisa testar a aplicação, considere usar o Expo Go:

```
npx expo start
```

E escaneie o QR code com o aplicativo Expo Go no seu dispositivo.

## Problemas Comuns e Soluções

1. **Erro de CRC persistente**: Use imagens PNG extremamente simples, geradas por ferramentas básicas como MS Paint

2. **Problemas com Android SDK**: Certifique-se de que o Android SDK está instalado e configurado corretamente:
   ```
   set ANDROID_HOME=C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk
   ```

3. **Dispositivo não encontrado**: Conecte um dispositivo Android via USB com depuração USB habilitada ou inicie um emulador pelo Android Studio

4. **Falha na compilação**: Execute `npx expo doctor` para diagnosticar problemas com dependências
