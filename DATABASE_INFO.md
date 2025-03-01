# Informações sobre Banco de Dados - LazzFit

## Firebase como Solução Completa

O LazzFit utiliza o **Firebase** como solução completa para autenticação e armazenamento de dados. Não é necessário configurar nenhum banco de dados adicional, pois o Firebase já fornece todas as ferramentas necessárias:

### 1. Firebase Authentication

- Gerencia todo o processo de autenticação (login, registro, recuperação de senha)
- Suporta autenticação por email/senha
- Pode ser expandido para autenticação via Google, Facebook, etc.

### 2. Cloud Firestore

- Banco de dados NoSQL em nuvem para armazenar os dados do aplicativo
- Atualização em tempo real
- Suporte a consultas complexas
- Estrutura flexível baseada em documentos e coleções

### 3. Firebase Storage

- Armazenamento de arquivos (imagens de perfil, fotos de treinos)

## Estrutura do Banco de Dados

O Firestore é organizado da seguinte forma:

```
firestore/
├── users/ (coleção)
│   ├── {userId}/ (documento)
│   │   ├── displayName: string
│   │   ├── email: string
│   │   ├── photoURL: string
│   │   ├── createdAt: timestamp
│   │   ├── stats: {
│   │   │   ├── workouts: number
│   │   │   ├── minutes: number
│   │   │   └── calories: number
│   │   │ }
│   │   └── routes/ (subcoleção)
│   │       ├── {routeId}/ (documento)
│   │       │   ├── distance: number
│   │       │   ├── duration: number
│   │       │   ├── startTime: timestamp
│   │       │   ├── endTime: timestamp
│   │       │   ├── coordinates: array
│   │       │   └── calories: number
├── workouts/ (coleção)
│   └── {workoutId}/ (documento)
│       ├── title: string
│       ├── description: string
│       ├── level: string
│       ├── duration: number
│       ├── imageUrl: string
│       └── exercises: array
```

## Como estamos usando o Firebase

1. **Autenticação:**
   - Registro de usuários via `registerUser()`
   - Login via `loginUser()`
   - Recuperação de senha via `resetPassword()`
   - Logout via `logoutUser()`

2. **Perfil de Usuário:**
   - Criação de perfil via `createUserProfile()`
   - Obtenção de perfil via `getUserProfile()`
   - Atualização de perfil via `updateUserProfile()`

3. **Registros de Treinos:**
   - Salvar rotas de exercícios via `saveWorkoutRoute()`
   - Obter histórico de rotas via `getUserRoutes()`

## Configuração do Firebase

O Firebase já está configurado no aplicativo através do arquivo `src/services/firebaseConfig.js`. As credenciais incluídas são de exemplo e devem ser substituídas pelas suas próprias credenciais quando for criar seu projeto Firebase.

## Criando seu próprio projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um novo projeto
3. Adicione um aplicativo Web
4. Copie as credenciais fornecidas
5. Substitua as credenciais no arquivo `firebaseConfig.js`
6. Habilite a autenticação por email/senha no console Firebase
7. Crie o banco de dados Firestore

Não é necessário configurar um banco de dados separado, pois o Firebase fornece uma solução completa para autenticação e armazenamento de dados.
