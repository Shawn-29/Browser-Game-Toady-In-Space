import { Timer } from './timer.js';

import { getImg } from './utilities.js';

export const Explosion = class {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.animIndex = 0;
        this.done = false;
        this.timer = new Timer(.075, function () {
            if (++this.animIndex >= Explosion.imgs.length) {
                this.done = true;
            }
        }.bind(this), true);
        this.timer.start();
    }
    update(dt, data = null) {
        this.timer.update(dt, data);
    }
    draw(context, xOffset = 0) {
        if (this.done) {
            return;
        }
        context.drawImage(
            Explosion.imgs[this.animIndex],
            this.x - xOffset - Explosion.imgs[this.animIndex].width * 0.5,
            this.y - Explosion.imgs[this.animIndex].height * 0.5
        );
    }
};
Explosion.imgs = [
    getImg('./images/enemies/Exp1.png'),
    getImg('./images/enemies/Exp2.png'),
    getImg('./images/enemies/Exp3.png')
];

export const ExpMgr = (() => {
    const EM_exps = [];
    return Object.freeze({
        addExp(x, y) {
            EM_exps.push(new Explosion(x, y));
        },
        update(dt, data = null) {
            for (const e of EM_exps) {
                e.update(dt, data);
                if (e.done) {
                    EM_exps.shift();
                }
            }
        },
        draw(context, xOffset = 0) {
            for (const e of EM_exps) {
                e.draw(context, xOffset);
            }
        },
        reset() {
            EM_exps.length = 0;
        }
    });
})();