<?php
error_reporting(E_ALL);
ini_set('display_errors', 'On');

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type,access-control-allow-credentials, auth');
header("Vary: Origin");

$origin = $_SERVER['HTTP_ORIGIN'];

if ($origin == "https://localhost:5500" || $origin == "https://www.frobeen.com" || $origin == "https://frobeen.com") {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: null');
}

if ($_SERVER["HTTPS"] == "off") {
    echo json_encode(['status' => 'error', 'langPath' => 'messages.error.httpsRequired', "ok" => false]);
    return;
}

require "DataRegistry.php";
require "usage.php";
require_once "vendor/autoload.php";

if ($_SERVER['REQUEST_METHOD'] == "OPTIONS") {
    echo json_encode(['status' => 'ok', 'message' => 'Options', "ok" => true]);
    exit;
}

use DataRegistry as DataRegistry;

$sendData = json_decode(file_get_contents('php://input'), true);//Später json_decode(file_get_contents('php://input'), true) verwenden ($_REQUEST)

$access_token = null;

if(isset($_COOKIE["authKey"])){
    $access_token = $_COOKIE["authKey"];
}

if(!isset($access_token)){
    $access_token = getBearerToken();
}

if (!isset($access_token)) {
    echo json_encode(array('status' => 'error', 'langPath' => 'messages.error.authorizationRequired', "ok" => false));
    exit;
}

if (!isset($sendData['actionId'])) {
    echo json_encode(array('status' => 'error', 'langPath' => 'messages.error.actionIdRequiered', "ok" => false));
    exit;
}

$actionId = intval($sendData['actionId']);

if ($actionId == 0) {
    echo json_encode(array('status' => 'error', 'langPath' => 'messages.error.actionIdRequiered', "ok" => false));
    exit;
}

$tokenTmp = getTokenFromAccessToken($access_token);

if ($tokenTmp === false) {
    echo json_encode(array('status' => 'error', 'langPath' => 'messages.error.invalidAuthToken', "ok" => false));
    exit;
}

$token = $tokenTmp;

DataRegistry::checkIfIsInitialized();

if (!isset($token) || $token === false) {
    echo json_encode(array('status' => 'error', 'langPath' => 'messages.error.tokenNotFount', "ok" => false));
    closeDB();
    exit;
}

$dataRegistry = new DataRegistry($token);
if($dataRegistry->exists()){
    if(!$dataRegistry->updateCosts()){
        echo json_encode(array('status' => 'error', 'langPath' => 'messages.error.whileUpdatingCost', "ok" => false));
        closeDB();
        exit;
    }
}

switch ($actionId) {
    case 1:
        echo json_encode($dataRegistry->getUsagePerModels());
        break;
    case 2:
        echo json_encode($dataRegistry->getCosts());
        break;
    case 3:
        $dataRegistry->getDataAsPdf();
        break;
    case 4:
        if (!isset($sendData['prompt']) || !isset($sendData['model'])) {
            echo json_encode(['status' => 'error', 'langPath' => 'messages.error.promptAndMessagesRequired', "ok" => false]);
            closeDB();
            exit;
        }
        $prompt = $sendData['prompt'];
        $model = $sendData['model'];
        echo json_encode($dataRegistry->promptImage($prompt, $model));
        break;
    case 5:
        if (!isset($sendData['messages']) || !isset($sendData['model'])) {
            echo json_encode(['status' => 'error', 'langPath' => 'messages.error.messagesAndModelRequired', "ok" => false]);
            closeDB();
            exit;
        }

        $messages = $sendData['messages'];
        $model = $sendData['model'];

        echo json_encode($dataRegistry->prompt($messages, $model));
        break;
    case 6:
        echo json_encode(['status' => 'ok', 'langPath' => 'User exists', "ok" => $dataRegistry->exists(), "info" => getAccessTokenInfo($access_token)]);
        break;
    case 7:
        if (!isset($sendData['prompt']) || !isset($sendData['model'])) {
            echo json_encode(['status' => 'error', 'langPath' => 'messages.error.promptAndModelRequired', "ok" => false]);
            closeDB();
            exit;
        }

        if (!isset($sendData["image"]) || !isset($sendData["mask"])) {
            echo json_encode(['status' => 'error', 'langPath' => 'messages.error.imageAndMaskRequired', "ok" => false]);
            closeDB();
            exit;
        }

        $prompt = $sendData['prompt'];
        $model = $sendData['model'];
        $image = $sendData["image"];
        $mask = $sendData["mask"];

        echo json_encode($dataRegistry->promptImageWithMask($prompt, $image, $mask));
        break;
    case 8:
        if (!isset($sendData['messages']) || !isset($sendData['model'])) {
            echo json_encode(['status' => 'error', 'langPath' => 'messages.error.messageAndModelRequired', "ok" => false]);
            closeDB();
            exit;
        }

        $messages = $sendData['messages'];
        $model = $sendData['model'];

        $returned = $dataRegistry->promptMessageStream($messages, $model);
        if(isset($returned)){
            echo json_encode($returned);
        }
        break;
    case 9:
        if($dataRegistry->exists()){
            echo json_encode(['status' => 'ok', 'langPath' => 'messages.success.login', "registered" => false, "ok" => $dataRegistry->exists(), "info" => getAccessTokenInfo($access_token)]);
        }else{
            DataRegistry::createUser($token);
            echo json_encode(['status' => 'ok', 'langPath' => 'messages.success.registered', "registered" => true, "ok" => true, "info" => getAccessTokenInfo($access_token)]);
        }

}

closeDB();

function getHash($hash)
{
    return hash('sha256', $hash);
}

function closeDB()
{
    if (isset(DataRegistry::$CONNECTION))
        DataRegistry::$CONNECTION->close();
}

function getUserIP()
{
    $ipaddress = '';
    if (isset($_SERVER['HTTP_CLIENT_IP']))
        $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
    else if (isset($_SERVER['HTTP_X_FORWARDED_FOR']))
        $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
    else if (isset($_SERVER['HTTP_X_FORWARDED']))
        $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
    else if (isset($_SERVER['HTTP_X_CLUSTER_CLIENT_IP']))
        $ipaddress = $_SERVER['HTTP_X_CLUSTER_CLIENT_IP'];
    else if (isset($_SERVER['HTTP_FORWARDED_FOR']))
        $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
    else if (isset($_SERVER['HTTP_FORWARDED']))
        $ipaddress = $_SERVER['HTTP_FORWARDED'];
    else if (isset($_SERVER['REMOTE_ADDR']))
        $ipaddress = $_SERVER['REMOTE_ADDR'];
    else
        $ipaddress = 'UNKNOWN';
    return hash('sha256', html_entity_decode($ipaddress, ENT_QUOTES, "UTF-8"));
}

function checkIfIsShortlyUsedIpAddresses()
{
    if (!file_exists("shortlyUsedIpAddresses.json")) {
        file_put_contents("shortlyUsedIpAddresses.json", json_encode(array()));
    }
    $data = json_decode(file_get_contents("shortlyUsedIpAddresses.json"), true);
    $ip = getUserIP();
    if (isset($data[$ip])) {
        $value = $data[$ip];
        $date = new DateTime($value);
        if (getLeftTimeUntilNow($date)) {
            echo json_encode(['status' => 'error', 'message' => 'You are not allowed to create a new user', "ok" => false]);
            return true;
        }
        $currentDate = new DateTime();
        $data[$ip] = $currentDate->format('Y-m-d H:i:s');
        file_put_contents("shortlyUsedIpAddresses.json", json_encode($data));
        return false;
    } else {
        $currentDate = new DateTime();
        $data[$ip] = $currentDate->format('Y-m-d H:i:s');
        file_put_contents("shortlyUsedIpAddresses.json", json_encode($data));
        return false;
    }
}

function getLeftTimeUntilNow($date)
{
    $now = new DateTime();
    $diff = $now->diff($date);
    if ($diff->h < 1) {
        return true;
    }
    return false;
}

function getTokenFromAccessToken($access_token)
{
    if (!isset($access_token)) {
        return false;
    }

    if ($access_token == "undefined" || $access_token == "null" || $access_token == "") {
        return false;
    }

    $url = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" . $access_token;
    $CLIENT_ID = "640190834544-spfibcnhqivfp8hpc5po8ke5ilg57t0e.apps.googleusercontent.com";

    $data = json_decode(file_get_contents($url), true);

    if (!isset($data)) {
        return false;
    }

    if (isset($data['error'])) {
        return false;
    }

    if (isset($data['error_description'])) {
        return false;
    }

    if ($data['aud'] != $CLIENT_ID) {
        return false;
    }

    return getHash(getHash($data['sub']));
}


function getAccessTokenInfo($access_token)
{
    if (!isset($access_token)) {
        return false;
    }
    $url = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" . $access_token;
    $CLIENT_ID = "640190834544-spfibcnhqivfp8hpc5po8ke5ilg57t0e.apps.googleusercontent.com";
    $data = json_decode(file_get_contents($url), true);
    if (isset($data['error_description'])) {
        return false;
    }

    if ($data['aud'] != $CLIENT_ID) {
        return false;
    }

    return [
        "email" => $data['email'],
        "name" => $data['name'],
        "imageData" => getImage($data['picture'])
    ];
}

function getImage($url)
{
    return base64_encode(file_get_contents($url));
}

function getBearerToken()
{
    $headers = getallheaders();
    if (!isset($headers)) {
        return null;
    }
    $authHeader = $headers['Auth'];
    if (!empty($authHeader)) {
        return str_replace("Bearer ", "", $authHeader);
    }
    return null;
}