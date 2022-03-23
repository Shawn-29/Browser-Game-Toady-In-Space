import { Enemy } from './base_enemy.js';

import { TILE_SIZE } from '../tile_mgr.js';

export const EnergyField = class extends Enemy {
    constructor(x, y, numHTiles, numVTiles) {
        super(-1, TILE_SIZE * numHTiles, TILE_SIZE * numVTiles, x, y);
        this.hueAccum = 0;
        this.step = false;
        this.blinkTimer.start().callback = function () {
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
        if (data['player'].collCheck(this, data['gameXPos'])) {
            data['player'].setHp(1, true);
        }
    }
    draw(context, xOffset = 0) {
        context.save();
        context.fillStyle = `rgba(${128 - (this.hueAccum >> 1)}, ${this.hueAccum}, ${255 - (this.hueAccum >> 1)}, 0.5)`;
        context.fillRect(this.left - xOffset, this.top, this.right - this.left, this.bot - this.top);
        context.restore();
    }
    collCheck(rect, xOffset = 0) { return false; }
};