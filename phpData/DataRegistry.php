<?php

require('fpdf/fpdf.php');
require("Tokenizer.php");
        
use Encoder as Encoder;
use Usage as Usage;
use FPDF as FPDF;

class DataRegistry{

    private string $token;
    private $data;

    private $isFriendVar = null;
    static mysqli $CONNECTION;

    static SensitiveParameterValue $OPEN_AI_KEY;

    static SensitiveParameterValue $DB_PASSWORD;
    static SensitiveParameterValue $DB_USERNAME;
    static SensitiveParameterValue $DB_NAME;
    static SensitiveParameterValue $DB_HOST;

    static SensitiveParameterValue $CREATE_NEW_USER_PASSWORD;

    static array $ALL_USER_KEYS = [];


    public function __construct($token){
        DataRegistry::checkIfIsInitialized();
        $this->token = $token;
        $this->data = $this->getData();
    }

    public function getUsagePerModels($inProgramm = false): array|bool{
        if($this->token == null){
            return false;
        }

        //get data from database with token ohne token
        $sql = "SELECT * FROM `userdata` WHERE `token` = ?";
        $prep = DataRegistry::$CONNECTION->prepare($sql);
        $prep->bind_param("s", $this->token);
        $success = $prep->execute();


        if($success){
            $result = $prep->get_result();
            if(!$result)return false;
            if($result->num_rows == 0){
                return false;
            }

            if($result->num_rows > 1){
                return false;
            }

            $data = $result->fetch_assoc();

            $usage = [];


            foreach($data as $key => $value){
                if($key == "token")continue;
                if($key == "totalCost"){
                    if($inProgramm){
                        $usage["totalCost"] = $value;
                    }
                    continue;
                }
                $us = explode(";", $value);

                if($key == "dall-e-2" || $key == "dall-e-3"){
                    if(!isset($usage["images"]))$usage["images"] = [];
                    if(count($us) != 1)continue;
                    $usage["images"][$key] = intval($us[0]);
                }else{
                    if(!isset($usage["contextTokens"]))$usage["contextTokens"] = [];
                    if(!isset($usage["generatedTokens"]))$usage["generatedTokens"] = [];
                    if(count($us) != 2)continue;
                    $usage["contextTokens"][$key] = intval( $us[0]);
                    $usage["generatedTokens"][$key] = intval($us[1]);
                }

            }

            return $usage;
        }else{
            
            return false;
        }
    }

    public function updateCosts(){
        $sqlGetLast = "SELECT `lastUpdated` FROM `userdata` WHERE `token` = ?";
        $prep = DataRegistry::$CONNECTION->prepare($sqlGetLast);
        $prep->bind_param("s", $this->token);
        $success = $prep->execute();
        if($success){
            $result = $prep->get_result();
            if($result->num_rows == 0){
                return false;
            }
            $data = $result->fetch_assoc();
            $lastUpdated = $data["lastUpdated"];
            $lastUpdated = new DateTime($lastUpdated);
            $now = new DateTime();
            $diff = $now->diff($lastUpdated);
            if($diff->days >= 365/2){
                $sql = "UPDATE `userdata`
                SET `gpt-3.5-turbo-1106` = '0;0',
                    `gpt-3.5-turbo-0613` = '0;0',
                    `gpt-3.5-turbo-16k-0613` = '0;0',
                    `gpt-3.5-turbo-0125` = '0;0',
                    `gpt-4-0613` = '0;0',
                    `gpt-4-vision-preview` = '0;0',
                    `gpt-4-0125-preview` = '0;0',
                    `gpt-4-1106-preview` = '0;0',
                    `dall-e-2` = '0',
                    `dall-e-3` = '0',
                    `totalCost` = '0'
                WHERE `token` = ?;
                ";
                $prep = DataRegistry::$CONNECTION->prepare($sql);
                $prep->bind_param("s", $this->token);
                $success = $prep->execute();
                if($success){
                    $sql = "UPDATE `userdata` SET `lastUpdated` = ? WHERE `token` = ?";
                    $prep = DataRegistry::$CONNECTION->prepare($sql);
                    $now = new DateTime();
                    $now = $now->format("Y-m-d H:i:s");
                    $prep->bind_param("ss", $now, $this->token);
                    $success = $prep->execute();
                    if($success){
                        $this->data = $this->getData();
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return false;
                }
            }else{
                return true;
            }
        }
        return false;
    }

    public function getToken(): string{
        return $this->token;
    }

    public function exists(): bool{
        if(DataRegistry::$CONNECTION->connect_error){
            return false;
        }

        $sql = "SELECT * FROM `userdata` WHERE `token` = ?";
        $perp = DataRegistry::$CONNECTION->prepare($sql);
        $perp->bind_param("s", $this->token);
        $success = $perp->execute();

        if($success){
            $result = $perp->get_result();
            if($result->num_rows > 1)return false;
            if($result->num_rows <= 0)return false;
            return true;
        }

        return false;

    }

    public function getCosts(): array{
        $usage = $this->getUsagePerModels(true);
        
        if(!$usage)return ["remainingCost"=>0, "totalCost"=>0, "usedCost"=>0, "models"=>[]];

        $names = [];
        foreach($usage["contextTokens"] as $key => $value){
            array_push($names, $key);
        }
        array_push($names, "dall-e-2");
        array_push($names, "dall-e-3");

        $costsPerModel = [];
        foreach($names as $name){
            if($name == "dall-e-2" || $name == "dall-e-3"){
                if(!isset($usage["images"][$name]))$usage["images"][$name] = 0;
                $costsPerModel[$name] = Usage::calculatePrice($name, $usage["images"][$name], $usage["images"][$name], $this->isFriend());
            }else{
                if(!isset($usage["contextTokens"][$name]))$usage["contextTokens"][$name] = 0;
                if(!isset($usage["generatedTokens"][$name]))$usage["generatedTokens"][$name] = 0;
                $costsPerModel[$name] = Usage::calculatePrice($name, $usage["contextTokens"][$name], $usage["generatedTokens"][$name], $this->isFriend());
            }
        }

        $costsPerModel = $this->isEveryModelSet($costsPerModel, 0);

        return [
            "models" => $costsPerModel,
            "usedCost" => array_sum($costsPerModel),
            "totalCost" => $usage["totalCost"],
            "remainingCost" => $usage["totalCost"] - array_sum($costsPerModel)
        ];
    }

    public function isEveryModelSet($array, $defaultVlaue){
        $models = ["gpt-4-0613", "gpt-3.5-turbo-1106", "gpt-3.5-turbo-0613", "gpt-3.5-turbo-16k-0613", "gpt-3.5-turbo-0125", "gpt-4-0125-preview", "gpt-4-1106-vision-preview", "gpt-4-1106-preview", "dall-e-2", "dall-e-3"];
        foreach($models as $model){
            if(!isset($array[$model])){
                $array[$model] = $defaultVlaue;
            }
        }
        return $array;
    }

    public function paidInCost($cost): bool{
        $sql = "UPDATE `userdata` SET `totalCost` = `totalCost` + ? WHERE `token` = ?";
        $prep = DataRegistry::$CONNECTION->prepare($sql);
        $prep->bind_param("ds", $cost, $this->token);
        $success = $prep->execute();

        if($success){
            return true;
        }else{
            return false;
        }
    }

    public function getDataAsPdf(){
        $usage = $this->getUsagePerModels();
        $costs = $this->getCosts();
        $usageOfCost = round(($costs["usedCost"] / $costs["totalCost"] * 100), 2);

        function mapValues($value, $min, $max, $newMin, $newMax){
            return ($value - $min) * ($newMax - $newMin) / ($max - $min) + $newMin;
        }
        // create pdf to download

        $WIDTHPDF = 210;

        $image = $this->getUsageImage($usageOfCost);

        $lineHeight = 7;

        $pdf = new CustomPdf();
        $pdf->AddPage();
        $pdf->SetFont('Arial','BU',22);
        $pdf->Cell($WIDTHPDF-10, 20,'OpenAI Usage Report', 0, 0, "C");
        $pdf->Ln($lineHeight*4);

        $pdf->SetFont('Arial','',12);
        $pdf->GDImage($image, $WIDTHPDF-50, $lineHeight*6, 20, 20);
        imagedestroy($image);

        $pdf->Cell(($WIDTHPDF-10)/3,10,'Total:', 0, 0, "L");
        $pdf->Cell(($WIDTHPDF-10)/2,10, "$" . round($costs["totalCost"], 2), 0, 0, "L");
        $pdf->Ln($lineHeight);

        $pdf->Cell(($WIDTHPDF-10)/3,10,'Remaining:', 0, 0, "L");
        $pdf->Cell(($WIDTHPDF-10)/2,10, "$" . round($costs["remainingCost"], 2), 0, 0, "L");
        $pdf->Ln($lineHeight);

        $pdf->Cell(($WIDTHPDF-10)/3,10,'Used:', 0, 0, "L");
        $pdf->Cell(($WIDTHPDF-10)/2,10, "$" . round($costs["usedCost"], 2), 0, 0, "L");
        $pdf->Ln($lineHeight*2);


        $pdf->SetFont('Arial','B',18);
        $pdf->Cell($WIDTHPDF-10,10,'Model Usage:', 0, 0, "C");
        $pdf->Ln($lineHeight*1.5);

        $pdf->SetFont('Arial','BI',14);

        $pdf->Cell($WIDTHPDF/3,10,'Model', 0, 0, "L");
        $pdf->Cell($WIDTHPDF/3,10,'Context Tokens', 0, 0, "C");
        $pdf->Cell($WIDTHPDF/3,10,'Generated Tokens', 0, 0, "C");
        $pdf->Ln($lineHeight);

        $pdf->SetFont('Arial','',12);
        foreach($usage["contextTokens"] as $key => $value){
            if($key == "dall-e-2" || $key == "dall-e-3")
                continue;
            $pdf->Cell($WIDTHPDF/3,10,$key, 0, 0, "L");
            $pdf->Cell($WIDTHPDF/3,10,$value, 0, 0, "C");
            $pdf->Cell($WIDTHPDF/3,10,$usage["generatedTokens"][$key], 0, 0, "C");
            $pdf->Ln($lineHeight);
        }

        $pdf->Ln($lineHeight);

        $pdf->SetFont('Arial','BI',14);
        $pdf->Cell($WIDTHPDF/2,10,'Model', 0, 0, "L");
        $pdf->Cell($WIDTHPDF/2,10,'Images', 0, 0, "C");
        $pdf->Ln($lineHeight);

        $pdf->SetFont('Arial','',12);
        $pdf->Cell($WIDTHPDF/2,10,"dall-e-2", 0, 0, "L");
        $pdf->Cell($WIDTHPDF/2,10,$usage["images"]["dall-e-2"], 0, 0, "C");
        $pdf->Ln($lineHeight);

        $pdf->Cell($WIDTHPDF/2,10,"dall-e-3", 0, 0, "L");
        $pdf->Cell($WIDTHPDF/2,10,$usage["images"]["dall-e-3"], 0, 0, "C");
        $pdf->Ln($lineHeight*3);

        $pdf->SetFont('Arial','B',18);
        $pdf->Cell($WIDTHPDF-10,10,'Costs:', 0, 0, "C");
        $pdf->Ln($lineHeight*1.5);

        $pdf->SetFont('Arial','BI',14);
        $pdf->Cell($WIDTHPDF/2,10,'Model', 0, 0, "L");
        $pdf->Cell($WIDTHPDF/2,10,'Cost', 0, 0, "C");
        $pdf->Ln($lineHeight);

        $pdf->SetFont('Arial','',12);
        foreach($costs["models"] as $key => $value){
            $pdf->Cell($WIDTHPDF/2,10,$key, 0, 0, "L");
            $pdf->Cell($WIDTHPDF/2,10,"$" . round($value, 2), 0, 0, "C");
            $pdf->Ln($lineHeight);
        }
        $pdf->Output("");
    }

    public function prompt($data, $model){

        $model = $this->_validateModel($model, false);
        $hasCreditsLeft = $this->hasCreditsLeft();

        if(!$hasCreditsLeft){
            return array('status' => 'error', 'ok' => false, 'langPath' => 'messages.error.noCreditsLeft');
        }

        $url = "https://api.openai.com/v1/chat/completions";
        $headers = [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
            'Accept: */*',
            'Accept-Language: en-US,en;q=0.5',
            "Content-Type: application/json",
            "Authorization: Bearer " . DataRegistry::$OPEN_AI_KEY->getValue()
        ];

        if(!is_array($data)){
            $data = [$data];
        }

        //check for images in data
        $id = null;
        $imageData = null;
        $imagePath = null;
        $messages = [];
        foreach($data as $message){
            if(isset($message["id"]) && isset($message["imageData"])){
                $imageData = $message["imageData"];
                $id = $message["id"];
                unset($message["imageData"]);
                unset($message["id"]);
                $messages[] = ["role" => $message["role"], "content" => $message["content"]];
            }else{
                $messages[] = $message;
            }
        }


        if($imageData != null && $id != null){
            if(!is_dir("tmpImages")){
                mkdir("tmpImages");
            }
            $imagePath = "./tmpImages/" . $id . ".jpg";
            file_put_contents($imagePath, base64_decode($imageData));
        }

        $contextOptions = [
            'http' => [
                'method' => 'POST',
                'header' => implode("\r\n", $headers),
                'mode' => 'cors',
                'content' => json_encode(["messages" => $messages, "model" => $model]),
            ]
        ];

        $context = stream_context_create($contextOptions);
        
        $response = file_get_contents($url, false, $context);

        if($imageData != null && $id != null){
            unlink($imagePath);
        }

        $response = json_decode($response);

        if(isset($response->usage)){
            if(!isset($this->data["requests"]))$this->data["requests"] = [];
            if(!isset($this->data["requests"][$model]))$this->data["requests"][$model] = ["contextTokens" => 0, "generatedTokens" => 0];
            $this->data["requests"][$model]["contextTokens"] += $response->usage->prompt_tokens;
            $this->data["requests"][$model]["generatedTokens"] += $response->usage->completion_tokens;

            $value = $this->data["requests"][$model]["contextTokens"] . 
            ";" . 
            $this->data["requests"][$model]["generatedTokens"];
            $this->update($model, $value);
        }
        $response->ok = true;
        return $response;
    }

    public function promptMessageStream($data, $model){
        $tokenizer = new Encoder();

        $model = $this->_validateModel($model, false);
        $hasCreditsLeft = $this->hasCreditsLeft();

        if(!$hasCreditsLeft){
            return array('status' => 'error', 'ok' => false, 'langPath' => 'messages.error.noCreditsLeft');
        }

        $url = "https://api.openai.com/v1/chat/completions";
        $headers = [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
            'Accept: */*',
            'Accept-Language: en-US,en;q=0.5',
            "Content-Type: application/json",
            "Authorization: Bearer " . DataRegistry::$OPEN_AI_KEY->getValue()
        ];

        if(!is_array($data)){
            $data = [$data];
        }

        //check for images in data
        $id = null;
        $imageData = null;
        $imagePath = null;
        $messages = [];
        foreach($data as $message){
            if(isset($message["id"]) && isset($message["imageData"])){
                $imageData = $message["imageData"];
                $id = $message["id"];
                unset($message["imageData"]);
                unset($message["id"]);
                $messages[] = ["role" => $message["role"], "content" => $message["content"]];
            }else{
                $messages[] = $message;
            }
        }


        if($imageData != null && $id != null){
            if(!is_dir("tmpImages")){
                mkdir("tmpImages");
            }
            $imagePath = "./tmpImages/" . $id . ".jpg";
            file_put_contents($imagePath, base64_decode($imageData));
        }

        $contents = ["messages" => $messages, "model" => $model, "stream"=>true];

        $contextOptions = [
            'http' => [
                'method' => 'POST',
                'header' => implode("\r\n", $headers),
                'mode' => 'cors',
                'content' => json_encode($contents),
            ]
        ];

        $context = stream_context_create($contextOptions);
        $stream = fopen($url, 'r', false, $context);

        if(is_bool($stream))return json_encode(array("error" => "Stream could not be opened"));

        $tokensGenerated = 0;
        $contentTokens = 0;


        for($i = 0; $i < count($messages); $i++){
            if(isset($msg["content"]) && !is_array($messages[$i]["content"])) {
                $contentTokens += count($tokenizer->encode($messages[$i]["content"]));
            }
        }

        header("Content-Type: application/octet-stream");
                
        while(!feof($stream)) {
            $result = fgets($stream);

            if($result === false) {
                break;
            }
            $result = str_replace("data: ", "", $result);

            if(trim($result) == "")continue;

            $result = trim($result);

            if($result == "[DONE]") {
                echo json_encode(["finished" => true]);
                break;
            }

            $json = json_decode($result, true);

            if($json === null) {
                continue;
            }

            if(!isset($json["choices"]) || !isset($json["choices"][0]) || !isset($json["choices"][0]["delta"]) || !isset($json["choices"][0]["delta"]["content"])){
                continue;
            }

            if(trim($json["choices"][0]["delta"]["content"]) == "") {
                continue;
            }

            if(isset($json["choices"][0]["delta"]["content"])) {
                $tokensGenerated += count($tokenizer->encode($json["choices"][0]["delta"]["content"]));
                echo json_encode(["message" => $json["choices"][0]["delta"]["content"]]) . "\n";
            }
            //Milliseconds (100) delay
            usleep(100 * 1000);
        }

        if(!isset($this->data["requests"]))$this->data["requests"] = [];
        if(!isset($this->data["requests"][$model]))$this->data["requests"][$model] = ["contextTokens" => 0, "generatedTokens" => 0];
        $this->data["requests"][$model]["contextTokens"] += $contentTokens;
        $this->data["requests"][$model]["generatedTokens"] += $contentTokens;

        $value = $this->data["requests"][$model]["contextTokens"] . 
        ";" . 
        $this->data["requests"][$model]["generatedTokens"];
        $this->update($model, $value);
    }

    public function promptImage($prompt, $model){
        $model = $this->_validateModel($model, true);
        
        $hasCreditsLeft = $this->hasCreditsLeft();

        if(!$hasCreditsLeft){
            return array('status' => 'error', 'ok' => false, 'langPath' => 'messages.error.noCreditsLeft');
        }

        $data = [
            "prompt" => $prompt,
            "model" => $this->_validateModel($model, true),
            "response_format" => "b64_json"
        ];


        $url = "https://api.openai.com/v1/images/generations";

        $headers = [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
            'Accept: */*',
            'Accept-Language: en-US,en;q=0.5',
            "Content-Type: application/json",
            "Authorization: Bearer " . DataRegistry::$OPEN_AI_KEY->getValue()
        ];


        $contextOptions = [
            'http' => [
                'method' => 'POST',
                'header' => implode("\n", $headers),
                'content' => json_encode($data),
            ]
        ];

        $context = stream_context_create($contextOptions);

        $response = file_get_contents($url, false, $context);

        $response = json_decode($response);

        if(isset($response)){
            if(!isset($this->data["images"]))$this->data["images"] = [];
            if(!isset($this->data["images"][$model]))$this->data["images"][$model] = 0;
            $this->data["images"][$model] += 1;
            $this->update($model, $this->data["images"][$model]);
        }
        
        $response->ok = true;
        return $response;
    }

    public function promptImageWithMask($prompt, $image, $mask){

        $model = "dall-e-2";
        
        $hasCreditsLeft = $this->hasCreditsLeft();

        if(!$hasCreditsLeft){
            return array('status' => 'error', 'ok' => false, 'langPath' => 'messages.error.noCreditsLeft');
        }

        //save both images
        if(!is_dir("tmpImages")){
            mkdir("tmpImages");
        }
        $imagePath = "./tmpImages/" . $this->token . ".png";
        $maskPath = "./tmpImages/" . $this->token . ".png";

        file_put_contents($imagePath, base64_decode($image));
        file_put_contents($maskPath, base64_decode($mask));

        $data = [
            "prompt" => $prompt,
            "model" => $model,
            "response_format" => "b64_json",
            "image" => new CURLFile($imagePath, 'image/png', 'image'),
            "mask" => new CURLFile($maskPath, 'image/png', 'mask')
        ];


        $url = "https://api.openai.com/v1/images/edits";

        $headers = [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
            'Accept: */*',
            'Accept-Language: en-US,en;q=0.5',
            "Content-Type: multipart/form-data",
            "Authorization: Bearer " . DataRegistry::$OPEN_AI_KEY->getValue()
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, ($data));

        $response = curl_exec($ch);

        curl_close($ch);

        if(file_exists($imagePath))
            unlink($imagePath);
        if(file_exists($maskPath))
            unlink($maskPath);

        $response = json_decode($response);

        if(isset($response) && isset($response->data)){
            if(!isset($this->data["images"]))$this->data["images"] = [];
            if(!isset($this->data["images"][$model]))$this->data["images"][$model] = 0;
            $this->data["images"][$model] += 1;
            $this->update($model, $this->data["images"][$model]);
        }
        
        $response->ok = true;
        return $response;
    }

    private function _validateModel($model, $isImageAi=false){
        if($isImageAi){
            if($model != "dall-e-3" && $model != "dall-e-2")
                return "dall-e-2";
            else
                return $model;
        }else{
            if($model != "dall-e-3" && $model != "dall-e-2")
                return $this->validateModel($model);
            else
                return "gpt-4-0613";
        }
    }

    public function getData(): array|bool{
        // connect to database

        //get data from database with token
        $sql = "SELECT * FROM `userdata` WHERE `token` = ?";
        $prep = DataRegistry::$CONNECTION->prepare($sql);
        $prep->bind_param("s", $this->token);
        $success = $prep->execute();

        if($success){
            $result = $prep->get_result();
            if(!$result)return false;
            if($result->num_rows == 0){
                return false;
            }
            if($result->num_rows > 1){
                return false;
            }

            $data = $result->fetch_assoc();
            $resultArray = [];

            foreach($data as $key => $value){
                if($key == "token")continue;
                $us = explode(";", $value);
                if(count($us) == 1){
                    $resultArray["images"][$key] = intval($us[0]);
                }else{
                    $resultArray["requests"][$key] = ["contextTokens" => intval($us[0]), "generatedTokens" => intval($us[1])];
                }
            }



            return $resultArray;
        }else{
            return false;
        }
    }

    static function checkIfIsInitialized(){
        if(!isset(DataRegistry::$DB_PASSWORD)){
            DataRegistry::$DB_PASSWORD = new SensitiveParameterValue("DatabasePassword"); 
            DataRegistry::$DB_USERNAME = new SensitiveParameterValue("php"); 
            DataRegistry::$DB_NAME = new SensitiveParameterValue("php");
            DataRegistry::$DB_HOST = new SensitiveParameterValue("localhost:56563");
        }
        
        DataRegistry::$OPEN_AI_KEY = new SensitiveParameterValue("OPEN_AI_KEY");

        if(!isset(DataRegistry::$CONNECTION)){
            DataRegistry::$CONNECTION = new mysqli(
                DataRegistry::$DB_HOST->getValue(), 
                DataRegistry::$DB_USERNAME->getValue(), 
                DataRegistry::$DB_PASSWORD->getValue(), 
                DataRegistry::$DB_NAME->getValue()
            );
            
            if (DataRegistry::$CONNECTION->connect_error) {
                die("Connection failed: " . DataRegistry::$CONNECTION->connect_error);
            }
        }

        if(!isset(DataRegistry::$ALL_USER_KEYS)){
            DataRegistry::$ALL_USER_KEYS = DataRegistry::getAllUserKeys();
        }
    }

    static function createUser($token): bool{

        // check connection
        if (DataRegistry::$CONNECTION->connect_error) {
            return false;
        }

        if(DataRegistry::existsUser($token) === false){
            $prep = DataRegistry::$CONNECTION->prepare("INSERT INTO `userdata` (`token`) VALUES (?)");
            
            $escaped = mysqli_real_escape_string(DataRegistry::$CONNECTION, $token);

            $prep->bind_param("s", $escaped);
            if ($prep->execute() === true) {
                return true;
            } else {
                
                return false;
            }
        }else{
            return false;
        }
    }

    static function existsUser($token): bool{
        if(DataRegistry::$CONNECTION->connect_error){
            return false;
        }

        $sql = "SELECT * FROM `userdata` WHERE `token` = ?";
        $perp = DataRegistry::$CONNECTION->prepare($sql);
        $perp->bind_param("s", $token);
        $success = $perp->execute();

        if($success){
            $result = $perp->get_result();
            if($result->num_rows > 1)return false;
            if($result->num_rows <= 0)return false;
            return true;
        }

        return false;
    }

    static function deleteUser($token): bool{
            if (DataRegistry::$CONNECTION->connect_error) {
                return false;
            }
    
            $prep = DataRegistry::$CONNECTION->prepare("DELETE FROM `userdata` WHERE `token` = ?");
            $prep->bind_param("s", $token);
    
            if ($prep->execute() === true) {
                
                return true;
            } else {
                
                return false;
            }
    }

    private static function getAllUserKeys(): array{
        // create connection to mysql database

        // check connection
        if (DataRegistry::$CONNECTION->connect_error) {
            die("Connection failed: " . DataRegistry::$CONNECTION->connect_error);
        }

        // get all tokens from database
        $sql = "SELECT `token` FROM `userdata`";
        $result = DataRegistry::$CONNECTION->query($sql);

        $tokens = [];

        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                array_push($tokens, $row["token"]);
            }
        }

        return $tokens;
    }

    private function getUsageImage($usageOfCost): GDImage{
        
        $width = 500;
        $height = 500;

        $max = 100;
        $min = 0;

        $image = imagecreate($width, $height);

        // Define colors
        $green = imagecolorallocate($image, 0, 255, 0);
        $red = imagecolorallocate($image, 255, 0, 0);
        $background = imagecolorallocate($image, 255, 255, 255);
        $white = imagecolorallocate($image, 255, 255, 255);
        $black = imagecolorallocate($image, 0, 0, 0);
        $arcColor = imagecolorallocate($image, floor(mapValues($usageOfCost, $min, $max, 0, 255)), floor(mapValues($usageOfCost, $min, $max, 255, 0)), 0);

        // Fill the background
        imagefilledrectangle($image, 0, 0, $width, $height, $background);

        // Draw the wedge representing usage
        $usageAngle = ($usageOfCost / ($max - $min)) * 360;
        $startAngle = -90;
        $endAngle = $startAngle + $usageAngle;
        imagefilledarc($image, $width / 2, $height / 2, $height, $height, $startAngle, $endAngle+0.0000001, $arcColor, IMG_ARC_PIE);

        // Fill the center with background color
        imagefilledellipse($image, $width / 2, $height / 2, $height / 2, $height / 2, $background);

        // Draw text with usage percentage in the center
        $usageText = $usageOfCost . "%";
        
        // Replace path by your own font path
        $font_file = './Roboto-Bold.ttf';
        $font_size = 50;

        $size   = imageftbbox($font_size, 0, $font_file, $usageText);
        $textWidth  = $size[2] - $size[6];
        $textHeight = $size[3] - $size[7];

        $textX = ($width - $textWidth) / 2;
        $textY = ($height - $textHeight) / 2 + 40;

        imagettftext($image, $font_size, 0, $textX, $textY, $black, $font_file, $usageText);

        return $image;
    }

    private function update($key, $value){

        $key = $this->validateModel($key);

        $sql = "UPDATE `userdata` SET `$key` = ? WHERE `token` = ?";


        $prep = DataRegistry::$CONNECTION->prepare($sql);


        $prep->bind_param("ss", $value, $this->token);

        $success = $prep->execute();

        if($success){
            
            return true;
        }else{
            
            return false;
        }
    }

    public function isFriend(){
        if($this->isFriendVar != null){
            return $this->isFriendVar;
        }

        $query = "SELECT * FROM `userdata` WHERE `token` = ? AND `friend` = 1";
        $prep = DataRegistry::$CONNECTION->prepare($query);
        $prep->bind_param("s", $this->token);
        $success = $prep->execute();

        if($success){
            $result = $prep->get_result();
            if($result->num_rows > 0){
                $this->isFriendVar = true;
                return true;
            }else{
                $this->isFriendVar = false;
                return false;
            }
        }else{
            $this->isFriendVar = false;
            return false;
        }
    }

    private function hasCreditsLeft(): bool{
        $costs = $this->getCosts();
        return $costs["remainingCost"] > 0;
    }

    private function validateModel($model){
        $returnModel = "";
        switch($model){
            case "gpt-4-turbo-preview":
                $returnModel = "gpt-4-1106-preview";
                break;
            case "gpt-4":
                $returnModel = "gpt-4-0613";
                break;
            case "gpt-3.5-turbo":
                $returnModel = "gpt-3.5-turbo-0613";
                break;
            case "gpt-3.5-turbo-16k":
                $returnModel = "gpt-3.5-turbo-16k-0613";
                break;
            case "gpt-4-0125-preview":
            case "gpt-4-1106-preview":
            case "gpt-4-0613":
            case "gpt-4-vision-preview":
            case "gpt-3.5-turbo-1106":
            case "gpt-3.5-turbo-0613":
            case "gpt-3.5-turbo-0125":
            case "gpt-3.5-turbo-16k-0613":
            case "dall-e-3":
            case "dall-e-2":
                $returnModel = $model;
                break;
        }
        return $returnModel;
    }

}


class CustomPdf extends FPDF
{
    function __construct($orientation='P', $unit='mm', $size='A4')
    {
        parent::__construct($orientation, $unit, $size);
        // Register var stream protocol
        stream_wrapper_register('var', 'VariableStream');
    }

    function MemImage($data, $x=null, $y=null, $w=0, $h=0, $link='')
    {
        // Display the image contained in $data
        $v = 'img'.md5($data);
        $GLOBALS[$v] = $data;
        $a = getimagesize('var://'.$v);
        if(!$a)
            $this->Error('Invalid image data');
        $type = substr(strstr($a['mime'],'/'),1);
        $this->Image('var://'.$v, $x, $y, $w, $h, $type, $link);
        unset($GLOBALS[$v]);
    }

    function GDImage($im, $x=null, $y=null, $w=0, $h=0, $link='')
    {
        // Display the GD image associated with $im
        ob_start();
        imagepng($im);
        $data = ob_get_clean();
        $this->MemImage($data, $x, $y, $w, $h, $link);
    }
}

class VariableStream
{
    public $context;
    private $varname;
    private $position;

    function stream_open($path, $mode, $options, &$opened_path)
    {
        $url = parse_url($path);
        $this->varname = $url['host'];
        if(!isset($GLOBALS[$this->varname]))
        {
            trigger_error('Global variable '.$this->varname.' does not exist', E_USER_WARNING);
            return false;
        }
        $this->position = 0;
        return true;
    }

    function stream_read($count)
    {
        $ret = substr($GLOBALS[$this->varname], $this->position, $count);
        $this->position += strlen($ret);
        return $ret;
    }

    function stream_eof()
    {
        return $this->position >= strlen($GLOBALS[$this->varname]);
    }

    function stream_tell()
    {
        return $this->position;
    }

    function stream_seek($offset, $whence)
    {
        if($whence==SEEK_SET)
        {
            $this->position = $offset;
            return true;
        }
        return false;
    }
    
    function stream_stat()
    {
        return array();
    }
}