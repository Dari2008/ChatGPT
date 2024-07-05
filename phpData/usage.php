<?php
class Usage{
   
static function calculatePrice($model, $contextTokens, $generatedTokens, $isFriend = false) {
        
    if (!array_key_exists($model, ($isFriend?Pricing::$PRICING_FRIEND:Pricing::$PRICING_DEFAULT))) {
        throw new Exception("Invalid model");
    }
    
    if ($contextTokens < 0 || $generatedTokens < 0) {
        throw new Exception("Invalid tokens");
    }
    
    if ($model == "dall-e-2" || $model == "dall-e-3") {
        return $contextTokens * ($isFriend?Pricing::$PRICING_FRIEND:Pricing::$PRICING_DEFAULT)[$model];
    }
    
    list($contextPrice, $generationPrice) = ($isFriend?Pricing::$PRICING_FRIEND:Pricing::$PRICING_DEFAULT)[$model];
    return ($contextTokens / ($isFriend?Pricing::$PER_TOKENS_FRIEND:Pricing::$PER_TOKENS_DEFAULT)) * $contextPrice + ($generatedTokens / ($isFriend?Pricing::$PER_TOKENS_FRIEND:Pricing::$PER_TOKENS_DEFAULT)) * $generationPrice;
}

static function getCost($data){

    
    function calculateTotalCost($models, $contextTokens, $generatedTokens, $isFriend = false) {
        if (count($models) !== count($contextTokens) || count($models) !== count($generatedTokens)) {
            throw new Exception("Invalid input");
        }

        if(is_array($models) && is_array($contextTokens) && is_array($generatedTokens) && count($models) == 0) return 0;
    
        $totalCost = 0;
        for ($i = 0; $i < count($models); $i++) {
            $cost = Usage::calculatePrice($models[$i], $contextTokens[$i], $generatedTokens[$i], $isFriend);
            $totalCost += $cost;
        }
        return $totalCost;
    }
    
    function loadCosts($data) {
        $imageAiRequestV2 = $data["requests"]["dall-e-2"];
        $imageAiRequestV3 = $data["requests"]["dall-e-3"];

    
        $models = [
            "gpt-4-0613",
            "gpt-3.5-turbo-0125",
            "gpt-3.5-turbo-1106",
            "gpt-3.5-turbo-16k-0613",
            "gpt-3.5-turbo-0613",
            "gpt-4-0125-preview",
            "gpt-4-1106-vision-preview",
            "gpt-4-1106-preview",
            "dall-e-2",
            "dall-e-3"
        ];
    
        $generatedTokens = [];
        $contextTokens = [];
    
        foreach ($models as $m) {
            if ($m == "dall-e-2" || $m == "dall-e-3") {
                continue;
            }
            if(!isset($data["generatedTokens"][$m]) || !isset($data["contextTokens"][$m])) {
                echo $m;
                array_splice($models, array_search($m, $models), 1);
                continue;
            }
            array_push($generatedTokens, $data["generatedTokens"][$m]);
            array_push($contextTokens, $data["contextTokens"][$m]);
        }
    
        array_push($generatedTokens, $imageAiRequestV2, $imageAiRequestV3);
        array_push($contextTokens, $imageAiRequestV2, $imageAiRequestV3);


        return calculateTotalCost($models, $contextTokens, $generatedTokens);
    }
    
    return loadCosts($data);
    
}

}

class Pricing{

    static $PRICING_FRIEND = [
        "gpt-3.5-turbo-1106" => [0.01, 0.0015],
        "gpt-3.5-turbo-0613" => [0.01, 0.0015],
        "gpt-3.5-turbo" => [0.01, 0.0015],
        "gpt-3.5-turbo-16k-0613" => [0.01, 0.0015],
        "gpt-3.5-turbo-16k" => [0.01, 0.0015],
        "gpt-3.5-turbo-0125" => [0.0005, 0.0015],
        "gpt-4-0613" => [0.03, 0.06],
        "gpt-4" => [0.03, 0.06],
        "gpt-4-turbo-preview" => [0.03, 0.06],
        "gpt-4-0125-preview" => [0.01, 0.03],
        "gpt-4-vision-preview" => [0.01, 0.03],
        "gpt-4-1106-preview" => [0.01, 0.03],
        "dall-e-2" => 0.05,
        "dall-e-3" => 0.08,
    ];

    static $PRICING_DEFAULT = [
        "gpt-3.5-turbo-1106" => [0.02, 0.0025],
        "gpt-3.5-turbo-0613" => [0.02, 0.0025],
        "gpt-3.5-turbo" => [0.02, 0.0025],
        "gpt-3.5-turbo-16k-0613" => [0.02, 0.0025],
        "gpt-3.5-turbo-16k" => [0.02, 0.0025],
        "gpt-3.5-turbo-0125" => [0.001, 0.0025],
        "gpt-4-0613" => [0.05, 0.08],
        "gpt-4" => [0.05, 0.08],
        "gpt-4-turbo-preview" => [0.04, 0.07],
        "gpt-4-0125-preview" => [0.02, 0.05],
        "gpt-4-vision-preview" => [0.02, 0.05],
        "gpt-4-1106-preview" => [0.02, 0.05],
        "dall-e-2" => 0.05,
        "dall-e-3" => 0.08,
    ];
    static $MAX_TOKENS = [
        "gpt-4-0125-preview" => 128000,
        "gpt-4-1106-preview" => 128000,
        "gpt-4-turbo-preview" => 128000,
        "gpt-4" => 8192,
        "gpt-4-0613" => 8192,
        "gpt-4-vision-preview" => 128000,
        "gpt-3.5-turbo" => 4096,
        "gpt-3.5-turbo-1106" => 16385,
        "gpt-3.5-turbo-0613" => 4096,
        "gpt-3.5-turbo-0125" => 16385,
        "gpt-3.5-turbo-16k" => 16385,
        "gpt-3.5-turbo-16k-0613" => 16385,
        "dall-e-3" => "",
        "dall-e-2" => "",
    ];

    static $PER_TOKENS_DEFAULT = 1000;
    static $PER_TOKENS_FRIEND = 1000;
}