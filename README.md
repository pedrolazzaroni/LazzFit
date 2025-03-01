# LazzFit

Aplicativo de fitness e treino desenvolvido com React Native/Expo.

## Visão Geral

LazzFit é um aplicativo de fitness que permite aos usuários:
- Acompanhar seus treinos
- Visualizar academias próximas no mapa
- Manter um perfil de usuário
- E muito mais!

## Versões Disponíveis

O aplicativo LazzFit está disponível em três variantes:

1. **Versão Mobile (React Native)**: App original para Android e iOS
2. **Versão Web**: Acessível pelo navegador
3. **Versão Desktop**: Aplicativo para Windows e macOS

## Executando a Versão Mobile

```bash
# Instalar dependências
npm install

# Iniciar o desenvolvimento
npx expo start
```

## Executando a Versão Web

Para executar no navegador:

```bash
# Método 1: Servidor de desenvolvimento
npx expo start --web

# Método 2: Build otimizado
npx expo export:web
npx serve web-build
```

Ou use os scripts incluídos:

```bash
# Construir + iniciar servidor
build-web-full.bat
serve-web.bat
```

## Executando a Versão Desktop

Para executar como aplicativo desktop:

```bash
# Verificar requisitos para desktop
desktop-check.bat

# Iniciar app desktop
run-desktop.bat
```

## Estrutura do Projeto

```
/
├── assets/               # Imagens e recursos
├── src/
│   ├── components/       # Componentes reutilizáveis
│   ├── contexts/         # Contextos React
│   ├── navigation/       # Configuração de navegação
│   ├── screens/          # Telas do aplicativo
│   ├── services/         # Serviços e APIs
│   ├── theme/            # Cores e estilos
│   └── utils/            # Funções utilitárias
├── web/                  # Arquivos específicos para web
├── app.json              # Configuração do Expo
├── App.js                # Componente principal
└── electron.js           # Ponto de entrada Electron
```

## Scripts Disponíveis

- `build-web.bat`: Gera versão para navegador
- `serve-web.bat`: Inicia servidor web local
- `run-desktop.bat`: Executa a versão desktop
- `fix-web-issues.bat`: Soluciona problemas comuns da versão web

## Tecnologias

- React Native / Expo
- Firebase (autenticação e banco de dados)
- Electron (versão desktop)
- React Navigation
- Expo Location

## Solução de Problemas

Se encontrar problemas com a versão web ou desktop, consulte:
- `como-corrigir-js-error.md`: Para problemas de JavaScript
- `DESKTOP_APP_GUIDE.md`: Para questões com a versão desktop
