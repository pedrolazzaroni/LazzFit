# LazzFit - Gerenciador de Treinos de Corrida

## Descrição
LazzFit é uma aplicação desktop desenvolvida em Python para gerenciar e acompanhar seus treinos de corrida. Com uma interface moderna e intuitiva, você pode registrar suas corridas, visualizar estatísticas e acompanhar seu progresso ao longo do tempo.

## Recursos
- Registro completo de treinos com:
  - Data e distância
  - Duração e ritmo automático
  - BPM médio e máximo
  - Ganho de elevação
  - Calorias queimadas
  - Tipo de treino personalizável
  - Notas/observações
- Dashboard com estatísticas gerais
- Visualização detalhada de todos os treinos
- Exportação de dados para CSV
- Gráficos para análise de desempenho
- Design moderno com tema laranja e preto

## Requisitos
- Python 3.8 ou superior
- Bibliotecas listadas em requirements.txt

## Instalação

1. Clone o repositório ou baixe os arquivos
2. Instale as dependências necessárias:

```bash
pip install -r requirements.txt
```

3. Execute o programa:

```bash
python main.py
```

## Uso

### Dashboard
Visualize estatísticas gerais dos seus treinos, incluindo distância total, número de corridas, tempo total e ritmo médio.

### Listar Corridas
Veja todos os seus treinos em formato de tabela, com opções para editar, excluir ou exportar registros.

### Nova Corrida
Adicione um novo treino preenchendo o formulário com os dados necessários, como distância, duração, BPM e tipo de treino.

### Estatísticas
Analise seu desempenho através de gráficos que mostram a evolução da distância, duração, ritmo e frequência cardíaca.

### Exportar Dados
Selecione treinos específicos ou exporte todos para um arquivo CSV que pode ser usado em outras ferramentas de análise.

## Personalização
O LazzFit foi desenvolvido com uma paleta de cores laranja e preto, mas você pode personalizar facilmente o código para usar outras cores de sua preferência modificando as variáveis de cor no início da classe LazzFitApp.
