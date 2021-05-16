import {Rect} from '../rect.js';

export const Button = class extends Rect {
    constructor(clickFn, width, height, x = 0, y = 0, upFn = null) {
        super(width, height, x, y);
        this.clickFn = clickFn;
        this.upFn = upFn;
    }
    update(dt, data = null) {
        return;
    }
    draw(context) {
        super.draw(context);
    }
    checkPoint(x, y) {
        if (Rect.checkPoint(x, y, this)) {
            if (this.clickFn)
                this.clickFn(this);
            
            return true;
        }
        return false;
    }
}