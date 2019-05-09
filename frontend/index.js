
//spin = require("./setup.js");

async function getnext() {
  return Promise.resolve(String(Math.floor(Math.random() * (36 - 0) + 0.5)));
  //return await spin();
}

var options = ["0", "32", "15", "19", "4", "21", "2", "25", "17", "34", "6", "27", "13", "36", "11", "30", "8", "23", "10", "5", "24", "16", "33", "1", "20", "14", "31", "9", "22", "18", "29", "7", "28", "12", "35", "3", "26"];

var startAngle = 0;
var arc = Math.PI / (options.length / 2);
var spinTimeout = null;

var spinArcStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;

var ctx;

function byte2Hex(n) {
  var nybHexString = "0123456789ABCDEF";
  return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
}

function RGB2Color(r,g,b) {
	return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function getColor(item, maxitem) {
  var phase = 0;
  var center = 128;
  var width = 127;
  var frequency = Math.PI*2/maxitem;
  
  red   = Math.sin(frequency*item+2+phase) * width + center;
  green = Math.sin(frequency*item+0+phase) * width + center;
  blue  = Math.sin(frequency*item+4+phase) * width + center;
  
  if (item == 0) {
    return RGB2Color(0,155,0);
  }
  if (item % 2 == 0) {
    return RGB2Color(0,0,0);
  } else {
    return RGB2Color(255,0,0);
  }
}

function drawRouletteWheel() {
  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var outsideRadius = 200;
    var textRadius = 160;
    var insideRadius = 125;

    ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,500,500);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.font = 'bold 18px Helvetica, Arial';

    for(var i = 0; i < options.length; i++) {
      var angle = startAngle + i * arc;
      //ctx.fillStyle = colors[i];
      ctx.fillStyle = getColor(i, options.length);

      ctx.beginPath();
      ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
      ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur    = 0;
      ctx.shadowColor   = "rgb(155,155,155)";
      ctx.fillStyle = "white";
      ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius, 
                    250 + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      var text = options[i];
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    } 

    //Arrow
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(250 - 4, 235 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 235 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 235 - (outsideRadius - 5));
    ctx.lineTo(250 + 9, 235 - (outsideRadius - 5));
    ctx.lineTo(250 + 0, 235 - (outsideRadius - 13));
    ctx.lineTo(250 - 9, 235 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 235 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 235 - (outsideRadius + 5));
    ctx.fill();
  }
}

function prespin(coef) {
  spinAngleStart = 0 * 10 + 10;
  var spinTime = 0;
  spinTimeTotal = coef;
  var SA = startAngle;
  while (spinTime < spinTimeTotal) {
    spinTime += 30;
    spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    SA += (spinAngle * Math.PI / 180);
  }
  var degrees = SA * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  var text = options[index];
  return text;
}

async function spin() {
  sh = await getnext();
  console.log(sh);
  var coef = 0;
  while (prespin(coef) !== sh || coef < 2500) {
    coef = coef + Math.floor(Math.random()*20) + 100;
  }
  console.log(coef);
  spinAngleStart = 0 * 10 + 10;
  spinTime = 0;
  spinTimeTotal = coef;
  rotateWheel();
}

function rotateWheel() {
  spinTime += 30;
  if(spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawRouletteWheel();
  spinTimeout = setTimeout('rotateWheel()', 30);
}

function stopRotateWheel() {
  clearTimeout(spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  ctx.save();
  ctx.font = 'bold 30px Helvetica, Arial';
  var text = options[index]
  ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
  ctx.restore();
}

function easeOut(t, b, c, d) {
  var ts = (t/=d)*t;
  var tc = ts*t;
  return b+c*(tc + -3*ts + 3*t);
}

window.onload = function(){
  document.getElementById("spin").addEventListener("click", spin);
  drawRouletteWheel();
};