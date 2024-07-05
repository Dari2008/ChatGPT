<?php

class Order{

    private $data;

    static $PAYMENT_CURRENCY = "USD";

    static $API_URL = "https://api-m.sandbox.paypal.com/v2/checkout/orders";

    static $API_SECRET = "EFcaRguXU3JYfyC8NDmFOsJJ1L1lvKXPjRDbiwMnGLODNejeiIzuCuvYlkRTSebWLfbEyJivJhyOQxvr";
    static $API_CLIENT_ID = "AZzfIyR5ZISHRX8ZOiiORKEHZp3tgxAQ7RUe0_votfFRsxGOnUq7YZV0U5EY6gjZvk5nnzVqmYJt155v";

    static $AUTH_KEY = "";

    public function __construct() {
        $this->data = [];
        $this->data["currency"] = Order::$PAYMENT_CURRENCY;
        $this->data["amount"] = 0;
        $this->data["token"] = "";
    }

    public function set($key, $value){
        $this->data[$key] = $value;
    }

    public function get($key){
        return $this->data[$key];
    }

    public function setToken($key){
        $this->data['token'] = $key;
    }

    public function getToken(){
        return $this->data['token'];
    }

    public function setAmount($amount){
        $this->data['amount'] = $amount;
    }

    public function getAmount(){
        return $this->data['amount'];
    }

    public function setOrderId($orderId){
        $this->data['orderId'] = $orderId;
    }

    public function getOrderId(){
        return $this->data['orderId'];
    }

    public function isApproved(): bool{
        $headers = [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
            'Accept: */*',
            'Accept-Language: en-US;q=0.5',
            'Authorization: Bearer ' . Order::$AUTH_KEY,
            'Content-Type: application/json',
        ];
        
        // Initialize cURL
        $ch = curl_init();
        
        // Set the options
        curl_setopt($ch, CURLOPT_URL, "https://api-m.sandbox.paypal.com/v2/checkout/orders/" . $this->data["orderId"] . "/capture");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, "{}");
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        
        if ($response === false) {
            curl_close($ch);
            return false;
        }
        
        curl_close($ch);
        
        $json = json_decode($response);
        $this->data['orderData'] = $json;

        if($json == null)return false;
        if(!isset($json->purchase_units[0]->payments->captures[0]->id))return false;
        if(!isset($json->purchase_units[0]->payments->captures[0]->amount->value))return false;
        if(!isset($json->purchase_units[0]->reference_id))return false;
        if(!isset($json->id))return false;

        $this->data["amount"] = $json->purchase_units[0]->reference_id=="fee"?$json->purchase_units[1]->payments->captures[0]->amount->value:$json->purchase_units[0]->payments->captures[0]->amount->value;
        $this->data["token"] = $json->purchase_units[0]->reference_id=="fee"?$json->purchase_units[1]->reference_id:$json->purchase_units[0]->reference_id;

        return true;
    }

    public function toAprovalJson(){
        $result = [];
        $result["amount"] = $this->data["amount"];
        $result["currency"] = $this->data["currency"];
        return $result;
    }

    public static function loadAuthBearer(){
        $headers = [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
            'Accept: */*',
            'Accept-Language: en-US,en;q=0.5',
            'Authorization: Basic ' . base64_encode(Order::$API_CLIENT_ID . ":" . Order::$API_SECRET),
            "Content-Type: application/x-www-form-urlencoded"
        ];
        
        // Initialize cURL
        $ch = curl_init();
        
        // Set the options
        curl_setopt($ch, CURLOPT_URL, "https://api-m.sandbox.paypal.com/v1/oauth2/token");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, "grant_type=client_credentials");
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        // Execute the request and get the response
        $response = curl_exec($ch);
        
        // Close cURL resource
        curl_close($ch);
        
        $json = json_decode($response);
        if($json == null)return;
        Order::$AUTH_KEY = $json->access_token;
    }

    public function createOrderId(){
        $headers = [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
            'Accept: */*',
            'Accept-Language: en-US,en;q=0.5',
            'Authorization: Bearer ' . Order::$AUTH_KEY,
            'Content-Type: application/json',
        ];
        
        // Initialize cURL
        $ch = curl_init();
        
        // Set the options
        curl_setopt($ch, CURLOPT_URL, Order::$API_URL);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($this->toOrderJson()));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        
        // Execute the request and get the response
        $response = curl_exec($ch);
        
        // Close cURL resource
        curl_close($ch);
        
        $json = json_decode($response);

        if($json->id == null)return false;

        $this->data['orderData'] = $json;
        $this->data['orderId'] = $json->id;
    }

    private function toOrderJson(){
        $result = [];
        $result["intent"] = "CAPTURE";
        $result["purchase_units"] = [];
        $result["purchase_units"][0] = [];
        $result["purchase_units"][0]["amount"] = [];
        $result["purchase_units"][0]["amount"]["currency_code"] = $this->data["currency"];
        $result["purchase_units"][0]["amount"]["value"] = $this->data["amount"];
        $result["purchase_units"][0]["reference_id"] = $this->data["token"];

        $result["purchase_units"][1] = [];
        $result["purchase_units"][1]["amount"] = [];
        $result["purchase_units"][1]["amount"]["currency_code"] = $this->data["currency"];
        $result["purchase_units"][1]["amount"]["value"] = $this->calculateFee($this->data["amount"]);
        $result["purchase_units"][1]["reference_id"] = "fee";
        return $result;
    }

    public function calculateFee($amount, $recursiveTimes = 0){
        if($recursiveTimes > 4)return 0;
        return round($amount * 0.0299 + ($recursiveTimes==0?0.30:0) + $this->calculateFee($amount, $recursiveTimes + 1), 2, PHP_ROUND_HALF_UP);
    }

    public function toJson(){
        $result = [];
        $result["orderId"] = $this->data["orderId"];
        return $result;
    }

}