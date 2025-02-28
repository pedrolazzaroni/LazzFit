# Configuração do Firebase para o LazzFit

## 1. Criar um Projeto no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Digite um nome para o projeto (ex: "LazzFit")
4. Ative o Google Analytics se desejar (recomendado)
5. Selecione sua conta do Google Analytics ou crie uma nova
6. Clique em "Criar projeto" e aguarde a criação ser concluída

## 2. Registrar seu Aplicativo

### Para Aplicativo Web:
1. Na página inicial do projeto, clique no ícone da web (</>) 
2. Digite um nome para o app (ex: "LazzFit Web")
3. Marque "Configurar também o Firebase Hosting" se desejar
4. Clique em "Registrar app"
5. **Copie o objeto de configuração** apresentado (será necessário para o próximo passo)

### Para Aplicativo Android:
1. Na página inicial do projeto, clique no ícone do Android
2. Insira o nome do pacote do seu app (geralmente `com.seudominio.lazzfit`)
3. Insira um apelido para o app (opcional)
4. Clique em "Registrar app"
5. Baixe o arquivo `google-services.json`
6. Mova o arquivo para a pasta `android/app` do seu projeto

### Para Aplicativo iOS:
1. Na página inicial do projeto, clique no ícone do iOS
2. Insira o ID do pacote (Bundle ID) do seu app
3. Insira um apelido para o app (opcional)
4. Clique em "Registrar app"
5. Baixe o arquivo `GoogleService-Info.plist`
6. Adicione este arquivo ao projeto iOS usando o Xcode

## 3. Atualizar a Configuração no Código

Substitua as informações no arquivo `src/services/firebase.js` com os dados que você copiou do Firebase Console.
