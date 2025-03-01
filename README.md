# LazzFit - App de Registro de Corridas

**LazzFit** é um aplicativo desktop desenvolvido em Python para registro e acompanhamento de atividades de corrida, com uma interface moderna em cores laranja e preto.

![LazzFit Screenshot](docs/screenshot.png)

## Recursos

- 🏃 **Registro de Corridas**: Registre suas corridas com distância, tempo, local e mais
- 📊 **Dashboard**: Visualize um resumo de suas atividades recentes
- 📈 **Estatísticas**: Acompanhe seu progresso com gráficos detalhados
- 🔄 **Histórico**: Veja todas as suas corridas passadas
- 🎯 **Ritmo e Calorias**: Cálculo automático de ritmo e calorias queimadas
- 🌓 **Temas**: Escolha entre modo claro e escuro

## Requisitos

- Python 3.7 ou superior
- Bibliotecas necessárias:
  - customtkinter
  - matplotlib
  - pillow

## Instalação

### 1. Clone o repositório ou baixe os arquivos

```bash
git clone https://github.com/seu-usuario/lazzfit.git
cd lazzfit
```

### 2. Crie um ambiente virtual (opcional, mas recomendado)

```bash
python -m venv venv
```

### 3. Ative o ambiente virtual

**Windows**:
```bash
venv\Scripts\activate
```

**Linux/Mac**:
```bash
source venv/bin/activate
```

### 4. Instale as dependências

```bash
pip install -r requirements.txt
```

## Executando o Aplicativo

Para iniciar o LazzFit, execute:

```bash
python main.py
```

## Estrutura do Projeto

```
LazzFit/
├── main.py           # Ponto de entrada do aplicativo
├── database.py       # Operações de banco de dados
├── themes.py         # Configurações de temas e cores
├── assets/           # Imagens e ícones
├── ui/               # Interfaces de usuário
│   ├── login_screen.py
│   ├── dashboard.py
│   ├── add_run.py
│   ├── statistics.py
│   └── settings.py
└── docs/             # Documentação
```

## Primeiro Uso

Ao iniciar o aplicativo pela primeira vez:

1. Crie uma conta usando a tela de registro
2. Faça login com suas credenciais
3. Use o botão "Adicionar Corrida" para registrar seu primeiro treino
4. Explore o dashboard e as estatísticas para acompanhar seu progresso

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests para melhorar o LazzFit.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.
