const PRICING = {
    "gpt-3.5-turbo-1106": [0.003, 0.007],
    "gpt-3.5-turbo-0613": [0.003, 0.007],
    "gpt-3.5-turbo-16k-0613": [0.003, 0.007],
    "gpt-3.5-turbo-0125": [0.003, 0.005],
    "gpt-4-0613": [0.005, 0.008],
    "gpt-4-0125-preview": [0.005, 0.008],
    "gpt-4-1106-vision-preview": [0.005, 0.008],
    "gpt-4-1106-preview": [0.005, 0.008],
    "dall-e-2": 0.1,
    "dall-e-3": 0.3,
};
  
function getCostFor(model, tokens, isGeneratedTokens = false) {
    if (PRICING[model] instanceof Array && PRICING[model] !== undefined) {
        return PRICING[model][isGeneratedTokens?1:0] * (tokens / 500);
    } else if(PRICING[model] !== undefined){
        return PRICING[model] * (tokens / 500);
    }else{
        return Infinity;
    }
}
  
function calculateCostCents(model, contextTokens, generatedTokens){
    if(model == "dall-e-2" || model == "dall-e-3") return getCostFor(model, generatedTokens, true);
    let cost = getCostFor(model, contextTokens);
    let costGenerated = getCostFor(model, generatedTokens, true);
    return cost + costGenerated;
}

function calculateCostDollars(model, contextTokens, generatedTokens){
    return calculateCostCents(model, contextTokens, generatedTokens) / 100;
}

function calculateTotalCost(models, contextTokens, generatedTokens){

    if(models.length !== contextTokens.length || models.length !== generatedTokens.length){
        throw new Error("Invalid input");
    }

    if(!(models instanceof Array))return;
    if(!(contextTokens instanceof Array))return;
    if(!(generatedTokens instanceof Array))return;

    let totalCost = 0;
    for (let i = 0; i < models.length; i++) {
        let cost = calculateCostCents(models[i], contextTokens[i], generatedTokens[i]);
        totalCost += cost;
    }
    return totalCost;
}