<?php
require_once __DIR__ . '/db_connect.php';

/**
 * Registra um novo usuário no sistema
 * @param string $username Nome de usuário
 * @param string $email E-mail
 * @param string $password Senha (não criptografada)
 * @param string $firstName Nome
 * @param string $lastName Sobrenome
 * @return array Status do registro e mensagem
 */
function registerUser($username, $email, $password, $firstName, $lastName) {
    $conn = getDbConnection();
    $result = ['success' => false, 'message' => ''];
    
    try {
        // Verificar se e-mail ou username já existem
        $checkStmt = $conn->prepare("SELECT * FROM users WHERE email = :email OR username = :username");
        $checkStmt->bindParam(':email', $email);
        $checkStmt->bindParam(':username', $username);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            $user = $checkStmt->fetch();
            if ($user['email'] == $email) {
                $result['message'] = "Este e-mail já está em uso.";
            } else {
                $result['message'] = "Este nome de usuário já está em uso.";
            }
            return $result;
        }
        
        // Criar hash seguro da senha
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        // Inserir usuário
        $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash, first_name, last_name, created_at, updated_at)
                               VALUES (:username, :email, :password_hash, :first_name, :last_name, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
        
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password_hash', $passwordHash);
        $stmt->bindParam(':first_name', $firstName);
        $stmt->bindParam(':last_name', $lastName);
        
        $stmt->execute();
        
        $userId = $conn->lastInsertId();
        
        // Criar preferências padrão do usuário
        $prefStmt = $conn->prepare("INSERT INTO user_preferences (user_id) VALUES (:user_id)");
        $prefStmt->bindParam(':user_id', $userId);
        $prefStmt->execute();
        
        $result['success'] = true;
        $result['message'] = "Usuário registrado com sucesso!";
        $result['user_id'] = $userId;
        
    } catch (PDOException $e) {
        $result['message'] = "Erro ao registrar: " . $e->getMessage();
        error_log("Erro no registro: " . $e->getMessage());
    }
    
    return $result;
}

/**
 * Faz login do usuário
 * @param string $email Email
 * @param string $password Senha
 * @return array Status do login e dados do usuário
 */
function loginUser($email, $password) {
    $conn = getDbConnection();
    $result = ['success' => false, 'message' => '', 'user' => null];
    
    try {
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() == 1) {
            $user = $stmt->fetch();
            
            if (password_verify($password, $user['password_hash'])) {
                // Senha correta
                // Remover senha hash antes de armazenar na sessão
                unset($user['password_hash']);
                
                // Iniciar sessão e armazenar dados do usuário
                session_start();
                $_SESSION['user_id'] = $user['user_id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['logged_in'] = true;
                $_SESSION['last_activity'] = time();
                
                // Atualizar última atividade do usuário no banco
                $updateStmt = $conn->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = :id");
                $updateStmt->bindParam(':id', $user['user_id']);
                $updateStmt->execute();
                
                $result['success'] = true;
                $result['message'] = "Login realizado com sucesso!";
                $result['user'] = $user;
            } else {
                $result['message'] = "Senha incorreta.";
            }
        } else {
            $result['message'] = "Usuário não encontrado.";
        }
    } catch (PDOException $e) {
        $result['message'] = "Erro ao fazer login: " . $e->getMessage();
        error_log("Erro no login: " . $e->getMessage());
    }
    
    return $result;
}

/**
 * Verifica se o usuário está logado
 * @return bool Status de autenticação
 */
function isLoggedIn() {
    session_start();
    
    // Verificar se a sessão existe e se o usuário está logado
    if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
        // Verificar tempo de inatividade
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > SESSION_TIME) {
            // Sessão expirada, fazer logout
            session_unset();
            session_destroy();
            return false;
        }
        
        // Atualizar tempo da última atividade
        $_SESSION['last_activity'] = time();
        return true;
    }
    
    return false;
}

/**
 * Faz logout do usuário
 * @return bool Sucesso do logout
 */
function logoutUser() {
    session_start();
    session_unset();
    session_destroy();
    return true;
}

/**
 * Obtém informações do usuário atual
 * @return array|null Dados do usuário ou null se não estiver logado
 */
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    $userId = $_SESSION['user_id'];
    $conn = getDbConnection();
    
    try {
        // Modificado para usar função MySQL TIMESTAMPDIFF em vez de DATE_PART/AGE
        $stmt = $conn->prepare("SELECT user_id, username, email, first_name, last_name, 
                                 profile_image, runner_level, 
                                 TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) as age,
                                 is_premium, gender, weight, height
                               FROM users WHERE user_id = :id");
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            return $stmt->fetch();
        }
    } catch (PDOException $e) {
        error_log("Erro ao obter usuário: " . $e->getMessage());
    }
    
    return null;
}
?>
