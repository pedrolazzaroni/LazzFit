<?php
/**
 * Script de verificação dos requisitos de sistema para o LazzFit
 * Execute este script antes da instalação para garantir compatibilidade
 */

echo "===================================================\n";
echo "      VERIFICAÇÃO DE REQUISITOS DO LAZZFIT\n";
echo "===================================================\n\n";

// Verificar versão do PHP
echo "Versão do PHP: " . PHP_VERSION . "\n";
if (version_compare(PHP_VERSION, '7.4.0', '<')) {
    echo "ERRO: O LazzFit requer PHP 7.4 ou superior\n";
} else {
    echo "OK: Versão do PHP compatível\n";
}

// Verificar extensões necessárias
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'fileinfo'];
echo "\nExtensões necessárias:\n";
foreach ($requiredExtensions as $ext) {
    if (extension_loaded($ext)) {
        echo "✓ $ext: Instalada\n";
    } else {
        echo "✗ $ext: Não instalada (Necessária)\n";
    }
}

// Verificar configurações do PHP
echo "\nConfigurações do PHP:\n";

$recommendedSettings = [
    'memory_limit' => '128M',
    'upload_max_filesize' => '10M',
    'post_max_size' => '10M',
    'max_execution_time' => '60',
    'display_errors' => 'Off'
];

foreach ($recommendedSettings as $setting => $recommended) {
    $current = ini_get($setting);
    echo "$setting: $current (Recomendado: $recommended)\n";
}

// Verificar se os diretórios necessários são graváveis
echo "\nPermissões de diretórios:\n";
$directories = [
    './',
    './images/',
    './images/users/',
    './images/badges/'
];

foreach ($directories as $dir) {
    if (!file_exists($dir)) {
        echo "✗ $dir: Diretório não existe\n";
        if (mkdir($dir, 0755, true)) {
            echo "  ✓ Diretório criado com sucesso\n";
        } else {
            echo "  ✗ Não foi possível criar o diretório\n";
        }
    } else if (is_writable($dir)) {
        echo "✓ $dir: Gravável\n";
    } else {
        echo "✗ $dir: Não gravável (Necessário permissão de escrita)\n";
    }
}

// Verificar conexão MySQL
echo "\nVerificando conexão MySQL:\n";

// Incluir arquivo de configuração se existir
if (file_exists('./config/database.php')) {
    include_once './config/database.php';
    echo "- Arquivo de configuração encontrado\n";
} else {
    echo "- Arquivo de configuração não encontrado\n";
    define('DB_SERVER', 'localhost');
    define('DB_PORT', '3306');
    define('DB_USERNAME', 'lazzfit_user');
    define('DB_PASSWORD', 'secure_password_here');
    define('DB_NAME', 'lazzfit_db');
}

try {
    $dsn = "mysql:host=" . DB_SERVER . ";port=" . DB_PORT;
    $conn = new PDO($dsn, DB_USERNAME, DB_PASSWORD);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✓ Conexão com MySQL estabelecida com sucesso\n";
    
    // Verificar se o banco de dados existe
    $stmt = $conn->prepare("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?");
    $stmt->execute([DB_NAME]);
    if ($stmt->rowCount() > 0) {
        echo "✓ Banco de dados '".DB_NAME."' existe\n";
    } else {
        echo "✗ Banco de dados '".DB_NAME."' não existe (Será criado durante a instalação)\n";
    }
} catch(PDOException $e) {
    echo "✗ Erro de conexão MySQL: " . $e->getMessage() . "\n";
    echo "  Verifique suas credenciais no arquivo config/database.php\n";
}

echo "\n===================================================\n";
echo "      VERIFICAÇÃO DE REQUISITOS CONCLUÍDA\n";
echo "===================================================\n";
?>
