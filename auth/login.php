<?php
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

// Validar campos obrigatórios
if (empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'E-mail e senha são obrigatórios']);
    exit;
}

// Realizar login
$result = loginUser($data['email'], $data['password']);

if ($result['success']) {
    // Configurar "lembrar de mim" se solicitado
    if (isset($data['remember']) && $data['remember'] === 'on') {
        $token = bin2hex(random_bytes(32));
        $userId = $result['user']['user_id'];
        
        // Em um sistema real, armazenaria este token em um banco de dados
        // e configuraria um cookie seguro com expiração adequada
        setcookie('remember_token', $token, time() + (86400 * 30), "/", "", true, true);
    }
    
    echo json_encode([
        'success' => true,
        'message' => $result['message'],
        'redirect' => '../dashboard.php'
    ]);
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => $result['message']]);
}
?>
