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

        let that = this;
        chrome.alarms.onAlarm.addListener(function (alarm) {
            if(alarm.name === 'timer') {
                that.onTimer();
            }
        })
    }

    newTimer(target: number) {
        this.targetTime = target;
        chrome.storage.local.set({ target: target }).then();

        chrome.alarms.create('timer', { when: target }).then();
    }

    onTimer() {
        console.log('test');
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
