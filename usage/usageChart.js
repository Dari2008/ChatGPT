function updateChart(usage){
    let chartCanvas = document.getElementById("usageChart");

    let max = 100;
    let min = 0;

    let context = chartCanvas.getContext("2d");

    context.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    let width = chartCanvas.width;
    let height = chartCanvas.height;


    // Color depending on value of usage if usage is 0 then color is green, if usage is 100 then color is red and it floats between green and red

    let color = "rgb(" + Math.floor(mapValues(usage, min, max, 0, 255)) + ", " + Math.floor(mapValues(usage, min, max, 255, 0)) + ", 0)";

    fillWedge(context, width/2, height/2, height/2, -90*Math.PI/180, (mapValues(usage, min, max, 0, 360)-90)*Math.PI/180, color);
    context.fill();

    //fill center with backgroundColor of #chart
    fillWedge(context, width/2, height/2, (height/10)*3, 0, 360, "#2b2b2b");

    //draw text with usage in % in the center of the chart
    context.fillStyle = "white";
    context.font = "30px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(usage + "%", width/2, height/2);

    function mapValues(value, min, max, newMin, newMax) {
        return (value - min) * (newMax - newMin) / (max - min) + newMin;
    }

    function fillWedge(context, cx,cy,radius,startAngle,endAngle,fillcolor){
        context.beginPath();
        context.moveTo(cx,cy);
        context.arc(cx,cy,radius,startAngle,endAngle);
        context.closePath();
        context.fillStyle=fillcolor;
        context.fill();
    }
}