import { Rect } from '../rect.js';

export const Shot = class extends Rect {
    constructor(width, height, x = 0, y = 0) {
        super(width, height, x, y);
        this.fired = false;
        this.vel = [0, 0];
    }
    update(dt, data = null) {
        if (this.fired)
            this.move(this.vel[0] * dt, this.vel[1] * dt);
    }
    fire(x, y) {
        this.setPos(x, y);
        this.fired = true;
    }
    static getShotLimit() {
        return 0;
    }
};