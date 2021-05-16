import {Enemy} from './base_enemy.js';

import {LEVEL_HEIGHT} from '../gameplay_constants.js';

export const Barrier = class extends Enemy {
    constructor(x) {
        super(-1, 100, LEVEL_HEIGHT, x, LEVEL_HEIGHT >> 1);
        this.hueAccum = 0;
        this.step = false;
        this.blinkTimer.start().callback = function() {
            if (!this.step) {
                this.hueAccum += 25;
                if (this.hueAccum > 255) {
                    this.step = true;
                }
            }
            else {
                this.hueAccum -= 25;
                if (--this.hueAccum < 0) {
                    this.step = false;
                }
            }
        }.bind(this);
        this.blinkTimer.dur = .04;
        this.blinkTimer.repeat = true;
    }
    update(dt, data = null) {
        super.update(dt, data);

        /* remove the barrier if it is the only enemy on the screen */
        if (data['enemyList'].size <= 1) {
            this.done = true;
        }
        
        if (data['player'].collCheck(this, data['gameXPos'])) {
            data['player'].setHp(1, true);
        }
    }
    draw(context, xOffset = 0) {
        //super.draw(context);
        context.save();
        context.fillStyle = `rgba(255, ${this.hueAccum}, ${this.hueAccum}, 0.75)`;
        context.fillRect(this.left - xOffset, this.top, this.right - this.left, this.bot - this.top);
        context.restore();
    }
    collCheck(rect, xOffset = 0) { return false; }
}