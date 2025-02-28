# Guia para Conectar e Executar no Dispositivo Android via USB

Este guia ajudará você a resolver problemas com a conexão USB entre seu computador e o dispositivo Android para executar o aplicativo LazzFit.

## 1. Preparando o Dispositivo Android

### Habilitar Opções de Desenvolvedor

1. Abra as **Configurações** do dispositivo
2. Vá para **Sobre o telefone** (ou **Sobre o dispositivo**)
3. Toque em **Número de compilação** 7 vezes até ver a mensagem "Você agora é um desenvolvedor"

### Habilitar Depuração USB

1. Volte para **Configurações** 
2. Vá para **Opções do desenvolvedor** (pode estar em Sistema > Opções do desenvolvedor)
3. Ative a opção **Depuração USB**
4. Quando conectar ao computador, aceite o prompt de autorização no dispositivo

## 2. Verificando a Conexão

Execute no terminal:

```bash
adb devices
```

Você deve ver algo como:
```
List of devices attached
XXXXXXXX    device
```

Se aparecer como `unauthorized`, desconecte e reconecte o cabo USB e aceite o prompt de autorização no dispositivo.

## 3. Problemas Comuns e Soluções

### Dispositivo não aparece na lista

- Tente outro cabo USB (alguns cabos são apenas para carregamento)
- Tente outra porta USB do computador
- Reinstale os drivers USB do dispositivo

### Solução para Windows

1. Baixe e instale os drivers USB do fabricante do dispositivo
2. Ou use o [Universal ADB Drivers](https://adb.clockworkmod.com/)

### Reiniciar servidor ADB

Se o dispositivo não estiver sendo detectado:

```bash
adb kill-server
adb start-server
adb devices
```

## 4. Executando o Aplicativo

### Método 1: Usando Expo Dev Client

```bash
npm run fix-usb  # Para corrigir problemas de configuração
npx expo start --clear  # Iniciar o servidor Expo
```

### Método 2: Build Direto no Dispositivo

```bash
npm run direct-android  # Executa diretamente no dispositivo conectado
```

## 5. Verificando os Logs

Para ver os logs do aplicativo em tempo real:

```bash
adb logcat *:E ReactNative:V ReactNativeJS:V
```

Isto mostrará apenas erros e logs específicos do React Native.
