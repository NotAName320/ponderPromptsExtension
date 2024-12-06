import Reason = chrome.offscreen.Reason;

class Timer {
    targetTime: number = -1

    constructor() {
        this.init();
    }

    init() {
        chrome.storage.local.get(['target']).then( (result) => {
            if(typeof result['target'] !== "undefined") {
                this.targetTime = result['target'];
            }
        });

        chrome.runtime.onStartup.addListener(this.createOffscreen);
        this.createOffscreen().then();

        chrome.alarms.onAlarm.addListener((alarm) => {
            if(alarm.name === 'timer') {
                this.onTimer();
            }
        });

        chrome.runtime.onMessage.addListener((message, sender) => {
            if(sender.url?.endsWith("main.html")) {
                switch (message['action']) {
                    case "startTimer":
                        this.newTimer(message['target']);
                        break;
                    case "stopTimer":
                        this.cancelTimer();
                        break;
                    default:
                        break;
                }
            }
        });
    }

    newTimer(target: number) {
        if(this.targetTime !== -1) return;
        this.targetTime = target;
        chrome.storage.local.set({ target: target }).then();

        chrome.alarms.create('timer', { when: target }).then();
    }

    cancelTimer() {
        this.targetTime = -1;

        chrome.storage.local.remove("target").then();
        chrome.alarms.clear("timer").then();
    }

    onTimer() {
        chrome.storage.local.remove("target").then();
        chrome.storage.local.set({ timerTriggered: true }).then();

        this.targetTime = -1;

        chrome.notifications.create("timerReached", {
            title: "Target Time Reached",
            message: "The timer has hit 0.",
            iconUrl: chrome.runtime.getURL("alarmRing.png"),
            type: "basic"
        });
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
