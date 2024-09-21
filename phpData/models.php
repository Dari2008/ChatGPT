<?php
// error_reporting(E_ALL);
// ini_set('display_errors', 'On');

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, auth');
header("Vary: Origin");

$origin = $_SERVER['HTTP_ORIGIN'];

if($origin == "https://localhost:5500" || $origin == "https://www.frobeen.com" || $origin == "https://frobeen.com"){
    header('Access-Control-Allow-Origin: '.$origin);
}else{
    header('Access-Control-Allow-Origin: null');
}

if($_SERVER["HTTPS"] == "off"){
    echo json_encode(['status' => 'error', 'message' => 'HTTPS is required', "ok" => false]);
    return;
}

require_once "usage.php";
require_once "DataRegistry.php";

use Pricing as Pricing;
use DataRegistry as DataRegistry;

if($_SERVER['REQUEST_METHOD'] == "OPTIONS"){  
    echo json_encode(['status' => 'ok', 'message' => 'Options', "ok" => true]);
    exit;
}

$sendData = json_decode(file_get_contents('php://input'), true);

$access_token = getBearerToken();

if(!isset($access_token)){
    echo json_encode(array('status' => 'error', 'message' => 'access_token is required', "ok" => false));
    exit;
}

$token = getTokenFromAccessToken($access_token);

if($token === false){
    echo json_encode(array('status' => 'error', 'message' => 'access_token is invalid', "ok" => false));
    exit;
}

DataRegistry::checkIfIsInitialized();

$user = new DataRegistry($token);

if(!$user->exists()){
    echo json_encode(array('status' => 'error', 'message' => 'User not found!', "ok" => false));
    closeDB();
    exit;
}

$isFriend = $user->isFriend();

if($isFriend){
    echo json_encode(['status' => 'ok', 'message' => 'Model returned', "ok" => true, "modelData" => Pricing::$PRICING_FRIEND, "costPerTokens" => Pricing::$PER_TOKENS_FRIEND, "maxTokens" => Pricing::$MAX_TOKENS]);
}else{
    echo json_encode(['status' => 'ok', 'message' => 'Model returned', "ok" => true, "modelData" => Pricing::$PRICING_DEFAULT, "costPerTokens" => Pricing::$PER_TOKENS_DEFAULT, "maxTokens" => Pricing::$MAX_TOKENS]);
}

return;

function getTokenFromAccessToken($access_token){
    if(!isset($access_token)){
        return false;
    }

    if($access_token == "undefined" || $access_token == "null" || $access_token == ""){
        return false;
    }

    $url = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=".$access_token;
    $CLIENT_ID = "";
    
    $data = json_decode(file_get_contents($url), true);

    if(!isset($data)){
        return false;
    }

    if(isset($data['error'])){
        return false;
    }

    if(isset($data['error_description'])){
        return false;
    }

    if($data['aud'] != $CLIENT_ID){
        return false;
    }

    return getHash(getHash($data['sub']));
}

function closeDB(){
    if(isset(DataRegistry::$CONNECTION))DataRegistry::$CONNECTION->close();
}

function getBearerToken() {
    $headers = getallheaders();
    if(!isset($headers)){
        return null;
    }
    $authHeader = $headers['Auth'];
    if (!empty($authHeader)) {
        return str_replace("Bearer ", "", $authHeader);
    }
    return null;
}
function getHash($hash){
    return hash('sha256', $hash);
}
