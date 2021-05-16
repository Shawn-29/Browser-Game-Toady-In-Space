import {Rect} from '../rect.js';

export const Item = class extends Rect {
    constructor(width, height, x, y) {
        super(width, height, x, y);
        this.done = false;
    }
    update(dt, data = null) {
        if (this.right - data['gameXPos'] <= 0) {
            this.done = true;
        }
    }
};