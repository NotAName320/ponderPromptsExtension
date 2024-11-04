import $ from 'jquery'


const FIRST_FIVE = new Set(["0", "1", "2", "3", "4", "5"]);
const NUMERALS = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);

class Main {
    constructor() {
        this.init();
    }

    init() {
        $(() => {
            let minBox = $("#minutes");
            let secBox = $("#seconds");
            minBox[0].addEventListener("keydown", this.moveCursor);
            secBox[0].addEventListener("keydown", this.moveCursorBack);
            secBox[0].addEventListener("keydown", this.secondsMax);
            let self = this;
            $(".numeric").each(function () {
                this.addEventListener("keydown", self.evalNumeric);
            });
        });
    }

    moveCursor(this: HTMLElement, event: KeyboardEvent): any {
        if(event.key === "Backspace") return;
        if((<HTMLInputElement>this).value.length >= 2) {
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
}

new Main();
