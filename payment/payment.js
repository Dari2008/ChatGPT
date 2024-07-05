var amountToPay = 0;

paypal.Buttons({
    style: {
        shape: 'pill',
        color: 'gold',
        layout: 'vertical',
        label: 'pay'
    },
    createOrder: async function (data, actions) {
        return await fetch(ORDERPATH, {
            method: 'post',
            headers: {
                'content-type': 'application/json',
                "Auth": "Bearer " + OpenAI.INSTANCE.getAccessToken(),
            },
            body: JSON.stringify({
                "action": "create",
                "amount": amountToPay
            })
        }).then(function (res) {
            return res.json();
        }).catch(alertError).then(function (data) {
            return data.orderId;
        }).catch(alertError);
    },
    onApprove: async function (data, actions) {
        return await fetch(ORDERPATH, {
            method: 'post',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                "action": "approved",
                "orderId": data.orderID,
                "payerId": data.payerID,
                "paymentId": data.paymentID
            })
        }).then(function (res) {
            return res.json();
        }).then(function (data) {
            isFinished = true;
            currentStage++;
            updateStage();
        }).catch(alertError);
    },
    onError: function (err) {
        closePay();
        alert(lang.get("messages.error.thereWasAnErrorWithThePament"), AlertType.ERROR, 4000);
    },
    onCancel: function (data) {
        closePay();
        alert(lang.get("messages.error.thePaymentWasCanceled"), AlertType.WARNING, 4000);
    }
}).render('#paypal-button-container');

function alertError(e) {
    closePay();
    alert(lang.get("messages.error.thereWasAnErrorWithThePament"), AlertType.ERROR, 4000);
}

document.addEventListener("documentLoaded", () => {
    document.getElementById("amountInput").addEventListener("keyup", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById("next").click();
        } else if (e.key === "Escape") {
            e.preventDefault();
            document.getElementById("back").click();
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            formatCurrency($(this));
            let value = parseFloat($(this).val().replace(/\./g, "").replace(/\,/g, ".").replace(/\$/g, ""));
            if (isNaN(value)) {
                value = 0;
            }
            if (e.shiftKey) {
                value -= 0.01;
            } else {
                value -= 1;
            }
            if (value < 0) {
                value = 0;
            }
            $(this).val(value.toFixed(2).replace(",", "").replace(/\./g, ","));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            formatCurrency($(this));
            let value = parseFloat($(this).val().replace(/\./g, "").replace(/\,/g, ".").replace(/\$/g, ""));
            if (isNaN(value)) {
                value = 0;
            }
            if (e.shiftKey) {
                value += 0.01;
            } else {
                value += 1;
            }
            if (value > 100) {
                value = 100;
            }
            $(this).val(value.toFixed(2).replace(",", "").replace(/\./g, ","));
        }
    });
});

$("#amountInput").on({
    input: function () {
        formatCurrency($(this));
        if ($(this).val().length == 0) {
            document.getElementById('next').disabled = true;
        } else {
            document.getElementById('next').disabled = false;
        }
    },
    blur: function () {
        formatCurrency($(this), "blur");
    }
});

function formatNumber(n) {
    // format number 1000000 to 1,000,000
    return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}


function formatCurrency(input, blur) {
    // appends $ to value, validates decimal side
    // and puts cursor back in right position.

    // get input value
    var input_val = input.val();

    // don't validate empty input
    if (input_val === "") { return; }

    let inputNumber = parseFloat(input_val.replace(/\./g, "").replace(/\,/g, ".").replace(/\$/g, "")).toFixed(2);

    if (isNaN(inputNumber)) {
        input.val("");
        return;
    }

    if (inputNumber < 0) {
        input.val("");
        return;
    }

    if (inputNumber > 100) {
        input.val("100,00");
        return;
    }

    // original length
    var original_len = input_val.length;

    // initial caret position 
    var caret_pos = input.prop("selectionStart");

    // check for decimal
    if (input_val.indexOf(",") >= 0) {

        // get position of first decimal
        // this prevents multiple decimals from
        // being entered
        var decimal_pos = input_val.indexOf(",");

        // split number by decimal point
        var left_side = input_val.substring(0, decimal_pos);
        var right_side = input_val.substring(decimal_pos);

        // add commas to left side of number
        left_side = formatNumber(left_side);

        // validate right side
        right_side = formatNumber(right_side);

        // On blur make sure 2 numbers after decimal
        if (blur === "blur") {
            right_side += "00";
        }

        // Limit decimal to only 2 digits
        right_side = right_side.substring(0, 2);

        // join number by .
        input_val = "" + left_side + "," + right_side;

    } else {
        // no decimal entered
        // add commas to number
        // remove all non-digits
        input_val = formatNumber(input_val);
        input_val = "" + input_val;

        // final formatting
        if (blur === "blur") {
            input_val += ",00";
        }
    }

    // send updated string to input
    input.val(input_val);

    // put caret back in the right position
    var updated_len = input_val.length;
    caret_pos = updated_len - original_len + caret_pos;
    input[0].setSelectionRange(caret_pos, caret_pos);

    amount = parseFloat(input_val.replace(/\./g, "").replace(/\,/g, ".").replace(/\$/g, ""));
}




var currentStage = 0;
var stages = 3;
var isFinished = false;
var amount = NaN;

function backStage() {
    if (currentStage > 0) {
        currentStage--;
        updateStage();
    } else {
        currentStage = 0;
        document.getElementById('pay').close();
    }
}

function nextStage() {
    if (currentStage < stages) {
        currentStage++;
        updateStage();
    } else {
        currentStage = 0;
        document.getElementById('pay').close();
    }
}

function nextStageWithPrice(amounts) {
    if (amounts > 0) {
        currentStage = 1;
        amount = amounts;
        updateStage();
    }

}

document.addEventListener("documentLoaded", () => {
    lang.addUpdater(updateStage);
});


function updateStage() {

    let nextElement = document.getElementById("next");
    let backElement = document.getElementById("back");

    function showCurrentStage(stage) {
        if(document.getElementById('stage' + (stage + 1)) != null){
            for (let i = 0; i < stages; i++) {
                if (i == stage) {
                    if(stage == 2){
                        document.getElementById('stage' + (i + 1)).style.display = "flex";
                    }else{
                        document.getElementById('stage' + (i + 1)).style.display = "block";
                    }
                }else{
                    document.getElementById('stage' + (i + 1)).style.display = "none";
                }
            }
        }
    }

    switch (currentStage) {
        case 0:
            nextElement.innerText = lang.get("payIn.next");
            backElement.innerText = lang.get("payIn.close");
            if(document.getElementById("amountInput").value.length == 0){
                nextElement.disabled = true;
                currentStage = 0;
            }else{
                nextElement.disabled = false;
            }
            showCurrentStage(0);
            break;
        case 1:
            calculateAmounts(amount);
            nextElement.innerText = lang.get("payIn.next");
            backElement.innerText = lang.get("payIn.back");
            showCurrentStage(1);
            break;
        case 2:
            nextElement.innerText = lang.get("payIn.waiting");
            nextElement.disabled = true;
            showCurrentStage(2);
            break;
        case 3:
            if(isFinished){
                isFinished = false;
                closePay();
                currentStage = 0;
                alert(lang.get("messages.success.thePaymentWasSuccessfull").replace("%amount%", amountToPay + ""), AlertType.SUCCESS, 4000);
            }
    }
}

function closePay() {
    document.getElementById('pay').close();
}

function calculateAmounts(amount) {
    let fee = calculateFee(amount);
    let total = amount + fee;
    document.getElementById('fee').innerText = "$" + fee.toFixed(2).replace(/\,/, "").replace(/\./g, ",");
    document.getElementById('total').innerText = "$" + total.toFixed(2).replace(/\,/, "").replace(/\./g, ",");
    document.getElementById('amountOverview').innerText = "$" + amount.toFixed(2).replace(/\,/, "").replace(/\./g, ",");

    amountToPay = amount;

}

function calculateFee(amount, recursiveTimes = 0) {
    if (recursiveTimes > 4) return 0;
    return parseFloat((Math.round((amount * 0.0299 + (recursiveTimes == 0 ? 0.30 : 0) + calculateFee(amount, recursiveTimes + 1)) * 100) / 100).toFixed(2));
}

document.addEventListener("documentLoaded", updateStage);