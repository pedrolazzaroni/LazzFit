# Testando o LazzFit com o Expo Go em Dispositivo Físico

O Expo Go permite testar o aplicativo em seu próprio celular sem necessidade de emulador ou build nativa.

## Pré-requisitos

1. Smartphone Android ou iOS
2. Aplicativo "Expo Go" instalado no dispositivo
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
3. Computador e smartphone na mesma rede WiFi

## Passos para Testar

### No Computador:

1. No terminal, na pasta do projeto LazzFit, execute:
   ```
   npm run device
   ```

2. Aguarde o Metro Bundler iniciar e exibir um QR code no terminal

### No Seu Smartphone:

#### Para Android:
1. Abra o aplicativo Expo Go
2. Toque em "Scan QR Code" 
3. Escaneie o QR code mostrado no terminal do computador

#### Para iOS:
1. Abra a câmera do iPhone
2. Aponte para o QR code no terminal
3. Toque na notificação que aparece

## Solução de Problemas

### Se o QR code não funcionar:

1. Verifique se seu telefone e computador estão na mesma rede WiFi
2. No aplicativo Expo Go, você pode inserir manualmente o URL mostrado no terminal
3. Tente desligar temporariamente o firewall do computador
4. Reinicie o comando com `npm run device`

### Se o aplicativo não carregar:

1. Verifique se o Expo Go tem todas as permissões necessárias
2. No projeto, execute `npm run reset-cache` e tente novamente
3. Verifique se todas as dependências estão instaladas (`npm install`)

## Recursos Adicionais

- [Documentação oficial do Expo Go](https://docs.expo.dev/get-started/expo-go/)
- [Depuração com Expo Go](https://docs.expo.dev/debugging/tools/)
