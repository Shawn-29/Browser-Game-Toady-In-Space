import {Enemy} from './base_enemy.js';
import {Rect} from '../rect.js';
import {Timer} from '../timer.js';

import {getImg} from '../utilities.js';

import {BASE_MOVE_VEL} from '../gameplay_constants.js';

export const Fan = class extends Enemy {
    constructor(x, y) {
        super(-1, 70, 70, x, y);
        this.area = new Rect(300, 70, this.left - 150, this.y);
        this.animIndex = 0;
        this.timer = new Timer(.1, function() { if (++this.animIndex >= Fan.imgs.length) this.animIndex = 0; }.bind(this), true).start();
    }
    update(dt, data = null) {
        this.timer.update(dt);
        const p = data['player'];
        if (Rect.checkPointsAgainst(p, this.area, -data['gameXPos'])) {
            p.movePlayer(-BASE_MOVE_VEL * .25, 0, dt, data['gameXPos']);
        }
    }
    draw(context, xOffset = 0) {
        context.drawImage(Fan.imgs[this.animIndex],
                          this.x - xOffset - (Fan.imgs[this.animIndex].width >> 1),
                          this.y - (Fan.imgs[this.animIndex].height >> 1));
        context.save();
        context.fillStyle = 'rgba(255, 0, 0, .5)';
        context.fillRect(this.area.left - xOffset, this.area.top, this.area.right - this.area.left, this.area.bot - this.area.top);
        context.restore();
    }
    collCheck(rect, xOffset = 0) { return false; }
};
Fan.imgs = [
    getImg('./images/enemies/FanA.png'),
    getImg('./images/enemies/FanB.png'),
    getImg('./images/enemies/FanC.png')
];