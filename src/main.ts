import $ from 'jquery'
import KeyUpEvent = JQuery.KeyUpEvent;

/**
 * Main class responsible for handling user input in the timer extension.
 * This class initializes event listeners for the html input fields to manage the focus
 * and establishes minimum and maximum values.
 */
class Main {
    // Initialize the class by setting up event listeners.
    constructor() {
        this.init();
    }

    /**
     * Sets up event listeners for the html input fields.
     * These listeners are added for keyup events on the minutes and seconds input fields
     * and on each element with the class minMax.
     */
    init() {
        $(() => {
            $("#minutes")[0].addEventListener("keyup", this.moveCursor);
            $("#seconds")[0].addEventListener("keyup", this.moveCursorBack);
            let self = this;
            $(".minMax").each(function () {
                this.addEventListener("keyup", self.enforceMinMax);
                console.log("asdf")
            })
        });
    }

    /**
     * Moves the cursor focus on the seconds input when the HTMLInputElement reaches 3 or more characters.
     * @param this - the HTMLInputElement where the event occurred.
     */
    moveCursor(this: HTMLInputElement): any {
        if(this.value.length >= 3) {
            $("#seconds").trigger("focus");
        }
    }

    /**
     * Moves the cursor focus back on the minutes input if the user presses backspace and the HTMLInputElement empty.
     * @param this - The HTMLInputElement where the event occurred.
     * @param ev - The keyboard event that triggered this function.
     */
    moveCursorBack(this: HTMLElement, ev: KeyboardEvent): any {
        if (ev.code !== "Backspace") return;
        if((<HTMLInputElement>this).value.length === 0) {
            $("#minutes").trigger("focus");
        }
    }

    /**
     * Establishes min and max values, trims the decimal, and ensures the value is an integer for the input value.
     * @param this - The HTMLInputElement where the event occurred.
     */
    enforceMinMax(this: HTMLInputElement) {
        if (this.value != "" && this.value != ".") {
            //chop off decimal
            this.value = String(parseInt(this.value));
            if (parseInt(this.value) < parseInt(this.min)) {
                this.value = String(Math.floor(parseInt(this.value) / 10));
            }
            if (parseInt(this.value) > parseInt(this.max)) {
                this.value = String(Math.floor(parseInt(this.value) / 10));
            }
        }
    }

}

// Instantiates the Main class to activate the event listeners
new Main();
