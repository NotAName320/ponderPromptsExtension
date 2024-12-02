import $ from 'jquery'


const FIRST_FIVE = new Set(["0", "1", "2", "3", "4", "5"]);
const NUMERALS = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);


class Main {
    minBox: JQuery = $()
    secBox: JQuery = $()
    startButton: JQuery = $()
    timerDisplay: JQuery = $()
    timerUpdaterId: number = 0;

    constructor() {
        this.init();
    }

    init() {
        $(() => {
            this.minBox = $("#minutes");
            this.secBox = $("#seconds");
            this.startButton = $("#startButton");
            this.timerDisplay = $("#timer");

            this.minBox[0].addEventListener("keydown", this.moveCursor);
            this.secBox[0].addEventListener("keydown", this.moveCursorBack);
            this.secBox[0].addEventListener("keydown", this.secondsMax);
            this.startButton[0].addEventListener("click", this.startTimer);

            let self = this;
            $(".numeric").each(function () {
                this.addEventListener("keydown", self.evalNumeric);
            });

            $(".persist").each(function () {
                chrome.storage.local.get([this.id]).then((result) => {
                    if(typeof result[this.id] === "undefined") {
                        (<HTMLInputElement>this).value = "";
                    } else {
                        (<HTMLInputElement>this).value = result[this.id];
                    }
                }, (_) => {
                    (<HTMLInputElement>this).value = "";
                });

                this.addEventListener("input", self.storePersist);
            });
        });

        chrome.storage.local.get(['target']).then( (result) => {
            if(typeof result['target'] !== "undefined") {
                let timeDiff = Math.floor((result['target'] - Date.now()) / 1000);
                let mins =  Math.floor(timeDiff / 60);
                let secs = (timeDiff % 60).toString().padStart(2, "0");
                $("#timer").text(`${mins}:${secs}`);
            }
        });
        this.timerUpdaterId = window.setInterval(() => timerCountdown(), 1000);
    }

    moveCursor(this: HTMLElement, event: KeyboardEvent): any {
        if(event.key === "Backspace") return;
        if((<HTMLInputElement>this).value.length >= 2) {
            // this is messy but we can't access secBox or minBox in here so we just have to rejiggle the selector
            $("#seconds").trigger("focus");
            if(!FIRST_FIVE.has(event.key)) {
                // If key would make invalid seconds value
                event.preventDefault();
            }
        }
    }

    moveCursorBack(this: HTMLElement, event: KeyboardEvent): any {
        if(event.key !== "Backspace") return;
        if((<HTMLInputElement>this).value.length === 0) {
            $("#minutes").trigger("focus");
        }
    }

    evalNumeric(this: HTMLElement, event: KeyboardEvent) {
        if(!NUMERALS.has(event.key) && event.key !== "Backspace")
        {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    secondsMax(this: HTMLElement, event: KeyboardEvent) {
        if((<HTMLInputElement>this).value.length === 0 && !FIRST_FIVE.has(event.key)) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    startTimer() {
        let mins = Number($("#minutes").val());
        let secs = Number($("#seconds").val());
        console.log(mins * 60 + secs);
        chrome.runtime.sendMessage({target: Date.now() + (mins * 60 + secs) * 1000}).then();
        let minString = mins.toString().padStart(2, '0');
        let secString = secs.toString().padStart(2, '0');
        $("#timer").text(`${minString}:${secString}`);
    }

    storePersist(this: HTMLInputElement) {
        chrome.storage.local.set({ [this.id]: this.value }).then();
    }
}


function timerCountdown() {
    let timerElement = $("#timer");
    let timerText = timerElement.text().split(":");
    let mins = Number(timerText[0]);
    let secs = Number(timerText[1]);
    if(secs === 0) {
        if(mins === 0) {
            return;
        } else {
            secs = 59;
            mins--;
        }
    } else {
        secs--;
    }
    let stringMins = mins.toString().padStart(2, "0");
    let stringSecs = secs.toString().padStart(2, "0");
    timerElement.text(`${stringMins}:${stringSecs}`);
}


new Main();
