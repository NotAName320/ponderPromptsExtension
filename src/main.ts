import $ from 'jquery'
import KeyUpEvent = JQuery.KeyUpEvent;

class Main {
    constructor() {
        this.init();
    }

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

    moveCursor(this: HTMLInputElement): any {
        if(this.value.length >= 3) {
            $("#seconds").trigger("focus");
        }
    }

    moveCursorBack(this: HTMLElement, ev: KeyboardEvent): any {
        if (ev.code !== "Backspace") return;
        if((<HTMLInputElement>this).value.length === 0) {
            $("#minutes").trigger("focus");
        }
    }

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

new Main();
