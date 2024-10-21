var interval;
var countDownSeconds;
var countDownMinutes;
var seconds = document.getElementById("seconds");
var minutes = document.getElementById("minutes");
var secondsString;
document.getElementById("startButton").addEventListener("click", startTimer);
document.getElementById("stopButton").addEventListener("click", stop);

function startTimer(){
    interval = setInterval(start, 1000);
    countDownMinutes = minutes.value;
    countDownSeconds = seconds.value;
    showTime()
}

function start(){
    if (countDownSeconds - 1 === -1 && countDownMinutes > 0) {
        countDownSeconds = 59;
        countDownMinutes--;
    }
    else {
        countDownSeconds--;
    }
    document.getElementById("timer").innerHTML = countDownMinutes + ":" + countDownSeconds;
    if (countDownSeconds === -1 && countDownMinutes === 0) {
        stop();
        document.getElementById("timer").innerHTML = "0:00";
    }

}

function showTime(){
    if (countDownSeconds - 1 === -1){
        secondsString = "00"
    }
    else if (countDownSeconds >= 0 && countDownSeconds <= 10){
        secondsString = "0" + countDownSeconds;
    }
    document.getElementById("timer").innerHTML = countDownMinutes + ":" + secondsString;
}

function stop(){
    clearInterval(interval);
}