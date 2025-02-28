# Configuração do Emulador Android para o LazzFit

## 1. Abrir o Android Studio

1. Abra o Android Studio instalado no seu computador
2. Se você não tem um projeto aberto, aparecerá a tela inicial
3. Se já tiver um projeto aberto, vá para a próxima etapa

## 2. Acessar o AVD Manager (Android Virtual Device Manager)

Há 3 maneiras de acessar o AVD Manager:

- **Na tela inicial**: Clique em "Configure" (no canto inferior direito) e depois em "AVD Manager"
- **Com projeto aberto**: Clique em "Tools" > "Device Manager" na barra de menu
- **Com ícone**: Clique no ícone de "Device Manager" na barra de ferramentas (parece um smartphone com um Android)

## 3. Criar um Novo Emulador

1. Clique no botão "+ Create Device" ou "Create Virtual Device"
2. Selecione um dispositivo (recomendado: Pixel 6 ou similar)
3. Clique em "Next"
4. Selecione uma imagem do sistema (recomendado: Android 13 ou mais recente)
   - Se a imagem ainda não estiver baixada, clique em "Download" ao lado dela
   - Aguarde o download e instalação
5. Clique em "Next"
6. Verifique as configurações e dê um nome ao seu emulador
7. Opcionalmente, aumente a memória RAM para melhor desempenho
8. Clique em "Finish"

## 4. Iniciar o Emulador

1. Na lista de dispositivos virtuais, encontre o emulador que você acabou de criar
2. Clique no botão "Play" (▶️) ao lado dele
3. Aguarde o emulador iniciar completamente (pode levar alguns minutos)

## 5. Verificar se o Emulador está Conectado

1. Abra um terminal/prompt de comando
2. Execute o comando `adb devices`
3. Você deverá ver seu emulador listado, algo como:
   ```
   List of devices attached
   emulator-5554    device
   ```
4. Se não aparecer, pode ser necessário reiniciar o adb:
   ```
   adb kill-server
   adb start-server
   ```

## 6. Executar o Aplicativo no Emulador

Com o emulador iniciado e funcionando, execute:

```
npm run android
```

ou

```
npx expo start --android
```

O aplicativo LazzFit será instalado e executado automaticamente no emulador.
