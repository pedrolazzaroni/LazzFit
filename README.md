# LazzFit - Gerenciador de Treinos de Corrida

LazzFit é uma aplicação desktop para gerenciar e visualizar seus treinos de corrida, desenvolvida com PyWebView, HTML/CSS/JavaScript e SQLite.

![LazzFit Screenshot](screenshots/lazzfit.png)

## Características Principais

- Interface moderna e responsiva
- Armazenamento local de dados (não requer conexão à internet)
- Dashboard com estatísticas principais
- Gerenciamento completo de treinos
- Visualização de estatísticas e gráficos de desempenho
- Exportação para Excel e CSV

## Requisitos do Sistema

- Python 3.7 ou superior
- Módulos Python:
  - pywebview
  - openpyxl (para exportação Excel)
- Sistema operacional: Windows, MacOS ou Linux

## Instalação

1. Clone o repositório ou baixe os arquivos
2. Instale as dependências:
   ```
   pip install pywebview openpyxl
   ```
3. Execute o aplicativo:
   ```
   python main.py
   ```

## Funcionalidades

### Dashboard

- Visualização rápida de estatísticas importantes:
  - Total de treinos
  - Distância total percorrida
  - Tempo total de corrida
  - Ritmo médio
- Gráfico de treinos recentes

### Gerenciamento de Treinos

- **Listar Treinos**: Visualize todos os seus treinos em ordem cronológica
- **Adicionar Treino**: Registre novos treinos com detalhes como:
  - Data
  - Tipo de treino (Corrida de Rua, Trail Running, etc.)
  - Distância percorrida (km)
  - Duração (minutos)
  - BPM médio e máximo (batimentos cardíacos)
  - Ganho de elevação (metros)
  - Calorias queimadas
  - Notas pessoais
- **Editar Treino**: Atualize informações de treinos existentes
- **Excluir Treino**: Remova treinos que não deseja mais acompanhar
- **Seleção Múltipla**: Selecione vários treinos para exportação ou outras ações

### Estatísticas

- **Distância & Duração**: Gráficos mostrando evolução ao longo do tempo
- **Ritmo & Cardio**: Análise do ritmo e frequência cardíaca
- **Resumo**: Visão geral de todas as estatísticas importantes e evolução mensal:
  - Total de treinos
  - Distância total e média
  - Tempo total e duração média
  - Ritmo médio
  - BPM médio (se disponível)
  - Ganho de elevação total (se disponível)

### Exportação de Dados

- **Exportar para Excel**: Exporte todos ou apenas treinos selecionados para um arquivo Excel (.xlsx)
- **Exportar para CSV**: Exporte todos ou apenas treinos selecionados para um arquivo CSV

### Outras Funcionalidades

- **Design Responsivo**: Interface adaptável a diferentes tamanhos de tela
- **Feedback Visual**: Notificações para ações e operações realizadas
- **Armazenamento Local**: Banco de dados SQLite para armazenar seus treinos
- **Saída Segura**: Garantia de persistência dos dados ao fechar o programa

## Uso

1. **Dashboard**: Visualize suas estatísticas principais
2. **Treinos**: Gerencie seus registros (adicionar, editar, excluir)
3. **Novo Treino**: Adicione um novo registro de corrida
4. **Estatísticas**: Analise seu progresso ao longo do tempo

## Exportação de Dados

Para exportar seus dados:

1. Na tela de Treinos, use os botões "Exportar CSV" ou "Exportar Excel"
2. Ou selecione treinos específicos e clique em "Exportar Selecionados"
3. Escolha o local e nome do arquivo para salvar

## Resolução de Problemas

- **Erro ao exportar para Excel**: Se receber um erro relacionado ao openpyxl, execute:
  ```
  pip install openpyxl
  ```
  O programa tentará instalar automaticamente, mas pode requerer permissões de administrador.

- **Banco de dados não encontrado**: O aplicativo cria automaticamente um banco de dados em `data/lazzfit.db`. Se houver problemas, verifique permissões de escrita no diretório.

## Créditos

Desenvolvido por [Seu Nome]

## Licença

Este projeto está licenciado sob [sua licença de escolha].
