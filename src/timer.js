import {getTimestamp} from './utilities.js';

export const Timer = class {
    constructor(dur, callback = null, repeat = true) {
        this.done = false;
        this.started = false;
        this.endTime = 0;
        this.curTime = 0.0;
        this.dur = dur;
        this.callback = callback;
        this.repeat = repeat;
    }
    start(dur = null) {
        this.done = false;
        this.started = true;
        this.curTime = getTimestamp();
        this.endTime = this.curTime + (dur ? dur : this.dur);
        return this;
    }
    update(dt, data = null) {
        if (this.started && !this.done) {
            this.curTime += dt;
            
            if (this.curTime >= this.endTime) {
                this.done = true;
                this.started = false;
                if (this.callback !== null) {
                    this.callback(data);
                }
                if (this.repeat) {
                    this.start();
                }
            }
        }
    }
    reset() {
        this.done = false;
        this.started = false;
    }
};