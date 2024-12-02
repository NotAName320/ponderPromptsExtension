import Reason = chrome.offscreen.Reason;

class Timer {
    targetTime: number = -1

    constructor() {
        this.init();
    }

    init() {
        chrome.storage.local.get(['target']).then( (result) => {
            if(typeof result !== "undefined") {
                this.targetTime = result['target'];
            }
        });

        chrome.runtime.onStartup.addListener(this.createOffscreen);
        this.createOffscreen().then();

        let that = this;
        chrome.alarms.onAlarm.addListener(function (alarm) {
            if(alarm.name === 'timer') {
                that.onTimer();
            }
        });

        chrome.runtime.onMessage.addListener(function (message, sender) {
            if(sender.url?.endsWith("main.html")) {
                if(typeof message['target'] !== "undefined") {
                    that.newTimer(message['target']);
                }
            }
        });
    }

    newTimer(target: number) {
        if(this.targetTime === -1) return;
        this.targetTime = target;
        chrome.storage.local.set({ target: target }).then();

        chrome.alarms.create('timer', { when: target }).then();
    }

    onTimer() {
        chrome.storage.local.remove("target").then();
        this.targetTime = -1;
    }

    async createOffscreen() {
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: [Reason.BLOBS],
            justification: 'keep service worker running',
        }).catch(() => {});
    }
}

new Timer();
