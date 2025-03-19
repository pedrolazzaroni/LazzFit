# LazzFit - Plataforma de Acompanhamento Fitness

LazzFit é uma aplicação web para acompanhamento de atividades físicas, focada em corrida e caminhada, permitindo que os usuários registrem seus treinos, acompanhem seu progresso e participem de uma comunidade fitness.

![LazzFit Logo](images/logo.png)

## 🌟 Características

- **Registro de treinos:** Distância, tempo, ritmo, calorias e sensação
- **Dashboard personalizado:** Visualize estatísticas e progresso
- **Planos de treinamento:** Crie e siga planos estruturados
- **Sistema de conquistas:** Ganhe medalhas por atingir objetivos
- **Comunidade interativa:** Compartilhe treinos e conecte-se com outros atletas
- **Design responsivo:** Funciona em dispositivos desktop e móveis

## 📋 Requisitos do Sistema

- PHP 7.4 ou superior
- MySQL 5.7 ou superior
- Servidor web (Apache ou Nginx)
- Extensões PHP: PDO, pdo_mysql, mbstring, json, fileinfo

## 🚀 Instalação

### 1. Configuração do Banco de Dados

Configure as informações do banco de dados no arquivo `config/database.php`:

```php
define('DB_SERVER', 'localhost');     // Servidor MySQL
define('DB_PORT', '3306');            // Porta MySQL
define('DB_USERNAME', 'seu_usuario'); // Nome de usuário
define('DB_PASSWORD', 'sua_senha');   // Senha
define('DB_NAME', 'lazzfit_db');      // Nome do banco de dados
```

### 2. Verificação do Sistema

Execute o script de verificação para confirmar que seu ambiente atende aos requisitos:

```bash
php check_system.php
```

### 3. Criação do Banco de Dados

Execute o script de instalação para criar o banco de dados e suas tabelas:

```bash
php db/install.php
```

Isso criará o banco de dados `lazzfit_db` (se não existir) e todas as tabelas necessárias.

### 4. Configuração do Servidor Web

#### Para Apache:
O arquivo `.htaccess` já está incluído na raiz do projeto. Certifique-se de que o módulo `mod_rewrite` está habilitado no Apache.

#### Para Nginx:
Adicione a seguinte configuração ao seu arquivo de site:

```nginx
server {
    listen 80;
    server_name seu_dominio.com;
    root /caminho/para/lazzfit;
    index index.php index.html;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
    }
    
    location ~ /\.ht {
        deny all;
    }
}
```

### 5. Permissões de Diretórios

Configure permissões adequadas para os diretórios de upload:

```bash
chmod -R 755 images/
```

## 👤 Usuário de Teste

Após a instalação, um usuário de teste é criado automaticamente:

- **Email:** demo@lazzfit.com
- **Senha:** senha123

## 📂 Estrutura de Diretórios

```
LazzFit/
├── auth/                  # Scripts de autenticação
├── config/                # Arquivos de configuração
├── css/                   # Estilos CSS
├── db/                    # Scripts e esquema do banco de dados
│   ├── schema.sql         # Estrutura do banco de dados
│   └── install.php        # Script de instalação
├── images/                # Diretório para imagens
│   ├── users/             # Fotos de perfil dos usuários
│   └── badges/            # Imagens das conquistas
├── includes/              # Funções PHP compartilhadas
├── js/                    # Scripts JavaScript
├── pages/                 # Páginas HTML/PHP
├── .htaccess              # Configuração do Apache
├── check_system.php       # Script de verificação do sistema
├── dashboard.php          # Painel principal do usuário
├── index.html             # Página inicial do site
└── README.md              # Este arquivo
```

## 💻 Uso

1. Acesse a página inicial em `http://seu_servidor/index.html`
2. Faça login com o usuário de teste ou crie uma nova conta
3. Use o dashboard para registrar treinos e acompanhar seu progresso

## 🔒 Segurança

- Todas as senhas são armazenadas com hash seguro usando `password_hash()`
- Proteção contra injeção SQL usando PDO com prepared statements
- Validação de dados de entrada no lado do cliente e servidor
- Proteção contra CSRF em formulários

## 🔄 Atualização

Para atualizar o esquema do banco de dados em versões futuras:

1. Faça backup do seu banco de dados atual
2. Atualize os arquivos do projeto
3. Execute scripts de migração (se fornecidos)

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## ✉️ Contato e Suporte

Para suporte ou dúvidas sobre o LazzFit, entre em contato:

- Email: contato@lazzfit.com.br
- Site: [lazzfit.com.br](https://lazzfit.com.br)
