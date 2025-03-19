<?php
// Ativar exibição de erros durante desenvolvimento
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log para depuração
error_log("Registro iniciado - " . date('Y-m-d H:i:s'));

require_once '../includes/auth_functions.php';

header('Content-Type: application/json');

// Verificar se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Obter dados do formulário
$data = json_decode(file_get_contents('php://input'), true);

if ($data === null) {
    $data = $_POST;
}

// Log para depuração
error_log("Dados recebidos: " . print_r($data, true));

// Validar campos obrigatórios
$requiredFields = ['name', 'email', 'password', 'confirm-password'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Por favor, preencha todos os campos obrigatórios']);
        exit;
    }
}

// Validar e-mail
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'E-mail inválido']);
    exit;
}

// Validar senha (mínimo 8 caracteres, pelo menos uma letra e um número)
if (strlen($data['password']) < 8 || !preg_match('/[A-Za-z]/', $data['password']) || !preg_match('/[0-9]/', $data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'A senha deve ter pelo menos 8 caracteres, incluindo letras e números']);
    exit;
}

// Confirmar senha
if ($data['password'] !== $data['confirm-password']) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'As senhas não correspondem']);
    exit;
}

// Verificar se aceitou os termos
if (!isset($data['terms']) || $data['terms'] !== 'on') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Você precisa aceitar os termos de uso']);
    exit;
}

// Preparar dados do usuário
$fullName = trim($data['name']);
$nameParts = explode(' ', $fullName);
$firstName = $nameParts[0];
$lastName = count($nameParts) > 1 ? implode(' ', array_slice($nameParts, 1)) : '';

// Gerar um username baseado no e-mail
$username = strtolower(explode('@', $data['email'])[0]) . rand(100, 999);

// Registrar o usuário
$result = registerUser($username, $data['email'], $data['password'], $firstName, $lastName);

if ($result['success']) {
    echo json_encode([
        'success' => true, 
        'message' => $result['message'],
        'redirect' => '../dashboard.php'
    ]);
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $result['message']]);
}
?>
