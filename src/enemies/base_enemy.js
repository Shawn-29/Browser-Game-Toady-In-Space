import { Rect } from '../rect.js';
import { Timer } from '../timer.js';
import { ExpMgr } from '../explosion_mgr.js';
import { SCORE_SHEET } from '../score_sheet.js';

export class Enemy extends Rect {
    constructor(hp, width, height, x = 0, y = 0) {
        super(width, height, x, y);
        this.hp = this.maxHp = hp;
        this.done = false;
        this.blinkTimer = new Timer(0.1, null, false);
    }
    update(dt, data) {
        this.blinkTimer.update(dt);

        if (this.right - data['gameXPos'] <= 0) {
            this.done = true;
        }
    }
    draw(context, xOffset = 0) {
        super.draw(context);
    }
    collCheck(rect, xOffset = 0) {
        return rect.collCheck(this, xOffset);
    }
    setHp(amt, data, addExp = true) {
        if (this.blinkTimer.started)
            return false;
        this.hp -= amt;
        if (this.hp <= 0) {
            if (addExp) {
                ExpMgr.addExp(this.x, this.y);
            }
            data['player'].tempScore += SCORE_SHEET[this.constructor.name];
            this.done = true;
        }
        this.blinkTimer.start();
        return true;
    }
}