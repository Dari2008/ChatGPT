<?php

// error_reporting(E_ALL);
// ini_set('display_errors', 'On');

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: access-control-allow-credentials,content-type,auth');
header('Content-Type: application/json');


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

require "DataRegistry.php";
require "Order.php";
use DataRegistry as DataRegistry;
use Order as Order;

DataRegistry::checkIfIsInitialized();
Order::loadAuthBearer();

if($_SERVER['REQUEST_METHOD'] == "OPTIONS"){
    echo json_encode(['status' => 'ok', 'message' => 'Options', "ok" => true]);
    exit;
}

$sendData = json_decode(file_get_contents('php://input'), true);


if(!isset($sendData['action'])){
    echo json_encode(array('status' => 'error', 'message' => 'action is required', "ok" => false));
    exit;
}

$action = $sendData['action'];


if($action == ""){
    echo json_encode(array('status' => 'error', 'message' => 'action is required', "ok" => false));
    exit;
}

$key = "";

if($action != "approved"){
    $key = getBearerToken();
    if(!isset($key)){
        echo json_encode(array('status' => 'error', 'message' => 'Auth is required', "ok" => false));
        exit;
    }

    $key = getTokenFromAccessToken($key);
    if(!$key){
        echo json_encode(array('status' => 'error', 'message' => 'Invalid auth', "ok" => false));
        exit;
    }
}


if($action == "create"){
    $user = getUser($key);

    if(!$user->exists()){
        echo json_encode(array('status' => 'error', 'message' => 'User not found', "ok" => false));
        exit;
    }
    $amount = 0;
    if(isset($sendData['amount'])){
        $amount = intval($sendData['amount']);
    }

    if($amount <= 0){
        echo json_encode(array('status' => 'error', 'message' => 'Amount must be greater than 0', "ok" => false));
        exit;
    }

    echo json_encode(createOrder($user, $amount));
    exit;
}else if($action == "approved"){

    if(!isset($sendData['orderId'])){
        echo json_encode(array('status' => 'error', 'message' => 'orderId is required', "ok" => false));
        exit;
    }

    $orderId = $sendData['orderId'];

    $order = new Order();
    $order->setOrderId($orderId);
    $success = $order->isApproved();

    if($success){
        $user = getUser($order->getToken());

        if($user == null || !$user->exists()){
            echo json_encode(array('status' => 'error', 'message' => 'User not found', "ok" => false));
            exit;
        }

        $success = $user->paidInCost($order->getAmount());

        if($success){
            echo json_encode(array('status' => 'ok', 'message' => 'Order is approved', "ok" => true));
        }else{
            echo json_encode(array('status' => 'error', 'message' => 'There was an error!', "ok" => false));
        }
    }else{
        echo json_encode(array('status' => 'error', 'message' => 'Order is not approved', "ok" => false));
    }

    exit;
}

function createOrder($user, $amount){
    $order = new Order();
    $order->setToken($user->getToken());
    $order->setAmount($amount);
    $order->createOrderId();
    return $order->toJson();
}

function getUser($key){
    $user = new DataRegistry($key);
    return $user;
}

function getHash($hash){
    return hash('sha256', $hash);
}

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
