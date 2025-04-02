<?php
$openrouter_api_key2 = 'YOUR_OPENROUTER_API_KEY';
$openrouter_api_key = 'YOUR_OPENROUTER_API_KEY';


header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}


if (isset($_FILES['file'])) {
    handleFileUpload();
    exit;
}


$input = file_get_contents('php://input');
$data = json_decode($input, true);


if (!isset($data['messages']) || !is_array($data['messages']) || !isset($data['model'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}


if ($data['model'] === 'gpt-4o') {
    $url = 'https://openrouter.ai/api/v1/chat/completions';
    $api_key = $openrouter_api_key2;
    $headers = [
        'Authorization: Bearer ' . $api_key,
        'Content-Type: application/json'
    ];
    $model = 'openai/gpt-4o-2024-05-13';
} elseif ($data['model'] === 'claude-3.5-sonnet') {
    $url = 'https://openrouter.ai/api/v1/chat/completions';
    $api_key = $openrouter_api_key;
    $headers = [
        'Authorization: Bearer ' . $api_key,
        'Content-Type: application/json',
        'HTTP-Referer: https://YOUR_WEBSITE_HERE.com',
        'X-Title: NetSim Web Simulator'
    ];
    $model = 'anthropic/claude-3.5-sonnet';
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid model']);
    exit;
}


$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'model' => $model,
    'messages' => $data['messages'],
    'max_tokens' => 8192,
    'temperature' => 1.0
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);


$response = curl_exec($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);


http_response_code($http_status);


echo $response;


function handleFileUpload() {
    if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'File upload failed']);
        exit;
    }

    $uniqueId = uniqid();
    $filePath = __DIR__ . '/websites/' . $uniqueId . '.html';

    if (move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
        $baseUrl = 'https://YOUR_WEBSITE_HERE.com';
        $generatedUrl = $baseUrl . '/websites/' . $uniqueId . '.html';
        echo json_encode(['url' => $generatedUrl]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save the website']);
    }
}
?>
