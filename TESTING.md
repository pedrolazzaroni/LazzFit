# Instruções de Teste - LazzFit

## Configuração do Ambiente
1. Clone o repositório
2. Instale as dependências: `npm install` ou `yarn install`
3. Configure as variáveis de ambiente necessárias

## Executando o Aplicativo
- **Android**: `npm run android` ou `yarn android`
- **iOS**: `npm run ios` ou `yarn ios`

## Roteiro de Testes Manuais

### Teste de Registro/Login
1. Abra o aplicativo
2. Registre um novo usuário ou faça login
3. Verifique se o perfil é carregado corretamente

### Teste de Corrida
1. Na tela principal, toque no botão "Iniciar Corrida"
2. Permita acesso à localização
3. Caminhe por alguns minutos
4. Verifique se a distância e o tempo estão sendo atualizados
5. Pause a corrida e verifique se o cronômetro para
6. Retome a corrida
7. Finalize a corrida
8. Verifique se o resumo da corrida é exibido corretamente

### Teste de Histórico
1. Navegue até a seção de Histórico
2. Verifique se a corrida recém-concluída aparece na lista
3. Toque na corrida para ver detalhes
4. Verifique se o mapa, distância, tempo e ritmo estão corretos
