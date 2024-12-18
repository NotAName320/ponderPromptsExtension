import $ from 'jquery'

import {questions} from "./questions";


const FIRST_FIVE = new Set(["0", "1", "2", "3", "4", "5"]);
const NUMERALS = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);


/**
 * Main class responsible for handling user input in the timer extension.
 * This class initializes event listeners for the html input fields to manage the focus
 * and establishes minimum and maximum values.
 */
class Main {
    constructor() {
        this.init();
    }

    /**
     * Sets up event listeners for the html input fields.
     * These listeners are added for keyup events on the minutes and seconds input fields
     * and on each element with the class minMax.
     */
    init(): void {
        $(() => {
            // some ui logic
            $("#minutes")[0].addEventListener("keydown", this.moveCursor);
            $("#seconds")[0].addEventListener("keydown", this.moveCursorBack);
            $("#seconds")[0].addEventListener("keydown", this.secondsMax);
            $("#startButton")[0].addEventListener("click", this.startTimer);
            $("#stopButton")[0].addEventListener("click", this.stopTimer);
            $("#submitAnswerButton")[0].addEventListener("mouseup", this.advanceQuestion);

            // ensure numeric values are typed into numeric inputs
            $(".numeric").each((_, element) => {
                element.addEventListener("keydown", this.evalNumeric);
            });

            // refill persistent data values
            $(".persist").each((_, element) => {
                chrome.storage.local.get([element.id]).then((result) => {
                    if(typeof result[element.id] === "undefined") {
                        (<HTMLInputElement>element).value = "";
                    } else {
                        (<HTMLInputElement>element).value = result[element.id];
                    }
                }, () => {
                    (<HTMLInputElement>element).value = "";
                });

                element.addEventListener("input", this.storePersist);
            });
        });

        // if target time in storage, set cosmetic timer to time
        chrome.storage.local.get(['target']).then( (result) => {
            if(typeof result['target'] !== "undefined") {
                const timeDiff = Math.floor((result['target'] - Date.now()) / 1000);
                const mins =  Math.floor(timeDiff / 60);
                const secs = (timeDiff % 60).toString().padStart(2, "0");
                $("#timer").text(`${mins}:${secs}`);
            }
        });

        // do things if timer triggered while asleep
        chrome.storage.local.get(['timerTriggered']).then((result) => {
            // timerTriggered not undefined or false
            if(result['timerTriggered']) {
                // chrome.storage.local.set({ timerTriggered: false }).then(); // comment this line out for persistency
                // which is what we want for now
                onTimer();
            } else {
                $("#timerPage").show();
            }
        })

        // start cosmetic timer effect
        window.setInterval(() => timerCountdown(), 1000);
    }


    /**
     * Moves the cursor focus on the seconds input when the HTMLInputElement reaches 3 or more characters.
     * @param {KeyboardEvent} event - The keyboard event that triggered this function.
     */
    moveCursor(this: HTMLElement, event: KeyboardEvent): void {
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

    /**
     * Moves the cursor focus back on the minutes input if the user presses backspace and the HTMLInputElement empty.
     * @param {KeyboardEvent} event - The keyboard event that triggered this function.
     */
    moveCursorBack(this: HTMLElement, event: KeyboardEvent): void {
        if(event.key !== "Backspace") return;
        if((<HTMLInputElement>this).value.length === 0) {
            $("#minutes").trigger("focus");
        }
    }

    /**
     * Establishes min and max values, trims the decimal, and ensures the value is an integer for the input value.
     * @param {KeyboardEvent} event - The keyboard event that triggered this function.
     */
    evalNumeric(this: HTMLElement, event: KeyboardEvent): void {
        if(!NUMERALS.has(event.key) && event.key !== "Backspace")
        {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    /**
     * Check that the seconds value is valid, i.e. cannot be more than 59 seconds.
     * @param {KeyboardEvent} event
     */
    secondsMax(this: HTMLElement, event: KeyboardEvent): void {
        if((<HTMLInputElement>this).value.length === 0 && !FIRST_FIVE.has(event.key)) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    /**
     * Starts the timer, notifying the background service and setting the display timer's value.
     */
    startTimer(): void {
        const mins = Number($("#minutes").val());
        const secs = Number($("#seconds").val());
        chrome.runtime.sendMessage({ action: "startTimer", target: Date.now() + (mins * 60 + secs) * 1000}).then();
        const secString = secs.toString().padStart(2, '0');
        $("#timer").text(`${mins}:${secString}`);
    }

    stopTimer(): void {
        chrome.runtime.sendMessage({ action: "stopTimer" }).then();
        $("#timer").text("0:00");
        $("#cancelText").show();
    }

    /**
     * Automatically store any persistent values in local storage.
     */
    storePersist(this: HTMLInputElement): void {
        chrome.storage.local.set({ [this.id]: this.value }).then();
    }

    /**
     * Code that executes when the user clicks the "submit question button"; submits to backend and then either goes to
     * next question or timer page depending on place in list of questions.
     */
    advanceQuestion(): void {
        chrome.storage.local.get(['questionIndex']).then( (result) => {
            // if there exists a next question
            if(result['questionIndex'] + 1 !== questions.length) {
                // show new question and increment in storage
                $('#question').text(questions[result['questionIndex'] + 1]['questionText']);
                chrome.storage.local.set({ questionIndex: result['questionIndex'] + 1}).then();
            } else {
                // switch pages again
                $('#questionsPage').hide();
                $('#timerPage').show();
                // tell storage that our state has changed back to timer page
                chrome.storage.local.set({ timerTriggered: false }).then();
            }
        });
    }
}

/**
 * Processes the display timer. If timer is at 0, does nothing. Set to run every second in Main initialization.
 */
function timerCountdown(): void {
    const timerElement = $("#timer");
    const timerText = timerElement.text().split(":");
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
    const stringSecs = secs.toString().padStart(2, "0");
    timerElement.text(`${mins}:${stringSecs}`);

    // runs when timer hits 0 for the first time (since subsequent 0s will be dealt with by early return
    // icky code cause repeating checks but it works, won't need further extension, and im too lazy to do it better
    if(mins === 0 && secs === 0) {
        onTimer();
    }
}

/**
 * Runs when the timer hits 0 and the user has the extension window open.
 */
function onTimer(): void {
    // switch to the questions page if not done already (should i make a function for this?)
    $('#timerPage').hide();
    $('#questionsPage').show();

    // set question to the correct one
    chrome.storage.local.get(['questionIndex']).then( (result) => {
        $('#question').text(questions[result['questionIndex']]['questionText']);
    });
}

// Instantiates the Main class to activate the event listeners
new Main();
