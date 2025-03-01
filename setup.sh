#!/bin/bash
echo "==================================================="
echo "              INSTALADOR LAZZFIT"
echo "==================================================="
echo

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "Python não encontrado! Por favor, instale o Python 3.7 ou superior."
    echo "Baixe em: https://www.python.org/downloads/"
    echo
    echo "Após instalar o Python, execute este script novamente."
    exit 1
fi

echo "Python encontrado! Verificando versão..."

# Verificar se a versão do Python é adequada
pyver=$(python3 --version 2>&1)
echo "Versão do Python: $pyver"

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo
    echo "Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo
echo "Ativando ambiente virtual..."
source venv/bin/activate

# Instalar dependências
echo
echo "Instalando dependências..."
pip install -r requirements.txt

# Criar diretório de assets se não existir
if [ ! -d "assets" ]; then
    echo
    echo "Criando diretório de assets..."
    mkdir assets
fi

echo
echo "==================================================="
echo "Instalação concluída!"
echo
echo "Para iniciar o LazzFit:"
echo "   1. Certifique-se de ativar o ambiente virtual: source venv/bin/activate"
echo "   2. Execute o aplicativo: python main.py"
echo "==================================================="

# Tornar o arquivo executável
chmod +x setup.sh
