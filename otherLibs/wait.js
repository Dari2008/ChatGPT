class Wait {

    static styleForWait = `
    #waitingDialog canvas {
        --width: 75px;
        --height: 75px;
        position: relative;
        padding: 3px;
        width: 50%;
        margin-right: auto;
        margin-left: auto;
    }
    
    #waitingDialog .spinWheelDiv {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
    }
    
    #waitingDialog {
        background-color: var(--bgColor);
        padding: 20px;
        border-radius: 10px;
        width: auto;
        height: max-content;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 400px;
        min-width: 200px;
    }
    
    #waitingDialog h1 {
        margin: 0;
        font-size: 1.5em;
    }
    
    #waitingDialog span {
        display: block;
        margin-top: 10px;
        font-size: 1.2em;
        word-wrap: break-word;
    }
    
    #waitingDialog:not([open]) {
        display: none !important;
    }
    
    :not(.light){
        #waitingDialog {
            --bgColor: rgb(64, 69, 73) !important;
        }
        #waitingDialog::backdrop {
            background-color: rgba(0, 0, 0, 0.5) !important;
        }
    }
    
    .light{
        #waitingDialog {
            --bgColor: rgb(214, 219, 223) !important;
        }
        #waitingDialog::backdrop {
            background-color: rgba(0, 0, 0, 0.5) !important;
        }
    }
    `;


    constructor() {
        this.dialog = document.createElement("dialog");
        this.dialog.id = "waitingDialog";

        this.spinWheelDiv = document.createElement("div");
        this.spinWheelDiv.classList.add("spinWheelDiv");

        this.canvas = document.createElement("canvas");
        this.canvas.id = "spinningWheel";
        this.canvas.width = 1000;
        this.canvas.height = 1000;

        this.spinWheelDiv.appendChild(this.canvas);

        this.span = document.createElement("span");

        this.dialog.appendChild(this.span);
        this.dialog.appendChild(this.spinWheelDiv);

        this.ctx = this.canvas.getContext("2d");

        document.body.appendChild(this.dialog);

        let style = document.createElement("style");
        style.innerHTML = Wait.styleForWait;

        document.body.appendChild(style);

        this.isOpened = false;

        this.deg = 0;
        this.degPerInterval = 4;

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.radius = this.width / 2;
        this.selectedDegres = 90;

        this.colorGradient = null;

        this.amount = 14;
        this.turn = 360;

        this.size = 90;

        this.strokeWidth = 35;

        this.colorCount = 1;

        this.createColorGradient = () => {
            this.colorGradient = this.ctx.createConicGradient(-90 * Math.PI / 180, this.width / 2, this.height / 2);
            for (let i = 0; i < this.turn / this.amount; i++) {
                let h = i * this.colorCount * (this.turn / this.amount);
                let degs = i * (this.turn / this.amount);
                this.colorGradient.addColorStop((degs / 360) > 1 ? degs / 360 - 1 : degs / 360, `hsl(${h}, 100%, 50%)`);
            }
        };
        this.createColorGradient();

        this.isRunning = false;

    }


    async wait(text, asyncFunction = async ()=>{return new Promise((res, rej)=>res());}, modal=true, args=[]) {
        if(this.isOpened){
            return;
        }
        if(this.isRunning){
            let wasAdded = false;
            if(!(this.currentThreadAmount + 1 > 300)){
                this.currentThreadAmount++;
                this.updateSpeed();
                wasAdded = true;
            }
            let result = await asyncFunction();
            if(wasAdded){
                this.currentThreadAmount--;
                this.updateSpeed();
            }
            if(this.currentThreadAmount <= 0){
                this.currentThreadAmount = 1;
            }
            return result;
        }
        this.isRunning = true;

        this.currentThreadAmount = 1;
        this.updateSpeed();
        this.span.innerHTML = text;
        this.start();
        if(modal)this.dialog.showModal();
        else this.dialog.show();
        let result = undefined;
        if(args.length <= 0){
            result = await asyncFunction();
        }else{
            result = await asyncFunction(args);
        }
        this.dialog.close();
        this.stop();
        this.isRunning = false;
        this.currentThreadAmount = 0;
        this.updateSpeed();
        this.delta = 0.0001;
        return result;
    };

    updateSpeed() {
        const minAmount = 1;
        const maxAmount = 300;
        const minValue = 1;
        const maxValue = 1000;
    
        const adjustedAmount = Math.max(minAmount, Math.min(this.currentThreadAmount, maxAmount));
    
        this.speed = Math.floor(mapValues(adjustedAmount, minAmount, maxAmount, 50, 400));
    }
    

    spinWheelFunc() {
        let now = performance.timeOrigin + performance.now();

        if (this.startTime){
            this.delta = (now - this.startTime) / 1000;
        }

        if(isNaN(this.deg)){
            this.deg = 0;
        }

        this.deg += this.degPerInterval*this.delta*this.speed;
        if(Math.floor(this.deg) == this.lastDeg){
            return;
        }
        this.lastDeg = Math.floor(this.deg);

        this.startTime = now;
        if (this.deg >= 360) {
            this.deg = 0;
        }

        const render = ()=>{
                
            let startAng = Math.floor(this.deg) - this.size / 2;
            let endAng = Math.floor(this.deg) + this.size / 2;

            this.ctx.clearRect(0, 0, this.width, this.height);

            this.ctx.lineWidth = this.strokeWidth;

            this.ctx.fillStyle = this.colorGradient;
            this.ctx.strokeStyle = this.colorGradient;
            this.ctx.lineCap = "round";

            function getPointOnCircle(centerX, centerY, radius, degree) {
                let radian = (degree % 360) * Math.PI / 180;
                let x = centerX + radius * Math.cos(radian);
                let y = centerY + radius * Math.sin(radian);
                return { x, y };
            }

            this.ctx.beginPath();
            this.ctx.arc(
                this.width / 2,
                this.height / 2,
                this.width / 2 - this.ctx.lineWidth / 2 - 1,
                startAng * Math.PI / 180,
                endAng * Math.PI / 180,
                false
            );
            this.ctx.arc(
                this.width / 2,
                this.height / 2,
                this.width / 2 - this.ctx.lineWidth / 2 - 1,
                endAng * Math.PI / 180,
                startAng * Math.PI / 180,
                true
            );
            this.ctx.closePath();
            this.ctx.stroke();

            this.ctx.beginPath();
            let point1 = getPointOnCircle(this.width / 2, this.height / 2, this.width / 2 - this.ctx.lineWidth / 2 - 1, startAng);
            let point2 = getPointOnCircle(this.width / 2, this.height / 2, this.width / 2 - this.ctx.lineWidth / 2 - 1, endAng + 2);
            this.ctx.arc(
                point1.x,
                point1.y,
                this.ctx.lineWidth / 2,
                0,
                2 * Math.PI
            );
            this.ctx.arc(
                point2.x,
                point2.y,
                this.ctx.lineWidth / 2,
                0,
                2 * Math.PI
            );
            this.ctx.closePath();
            this.ctx.fill();
        };

        render();

        if(this.stoped)return;
    };

    stop() {
        this.stoped = true;
        clearInterval(this.id);
        this.id = undefined;
    }

    start() {
        this.stoped = false;
        if(this.id)this.stop();
        this.id = setInterval(this.spinWheelFunc.bind(this), 1);
    }

}

document.addEventListener("documentLoaded", ()=>{
    
    Wait.INSTANCE = new Wait();

    window.wait = Wait.INSTANCE.wait.bind(Wait.INSTANCE);
    document.wait = Wait.INSTANCE.wait.bind(Wait.INSTANCE);
});

