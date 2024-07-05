<?php
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: POST, OPTIONS');
// header('Access-Control-Allow-Headers: access-control-allow-credentials,content-type');
// header('Content-Type: image/png');

// require "DataRegistry.php";

// if($_SERVER['REQUEST_METHOD'] == "OPTIONS"){  
//     echo json_encode(['status' => 'ok', 'message' => 'Options', "ok" => true]);
//     exit;
// }

// use DataRegistry as DataRegistry;

// // save file if user exists

// // if(!isset($sendData['token'])){
// //     echo json_encode(array('status' => 'error', 'message' => 'token is required', "ok" => false));
// //     exit;
// // }

// // if(!isset($_FILE["image"])){
// //     echo json_encode(array('status' => 'error', 'message' => 'image is required', "ok" => false));
// // }

// if(DataRegistry::existsUser($sendData['token'])){
//     $filename = './uploads/' . $sendData['token'] . '.png';
//     mkdir("./uploads/");
//     move_uploaded_file($_FILES['image']['tmp_name'], $filename);
//     echo json_encode(['status' => 'ok', 'message' => 'File uploaded', "ok" => true]);
//     exit;
// }

echo json_encode($_FILES);
echo json_encode($_POST);
echo json_encode($_GET);