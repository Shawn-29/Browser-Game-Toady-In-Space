import { Item } from './item_base.js';
import { ShotSwap } from './shot_swap.js';

import { drawHitFrame, getImg } from '../utilities.js';

export const SpeedBoost = class extends Item {
    constructor(x, y) {
        super(SpeedBoost.img.width, SpeedBoost.img.height, x, y);
    }
    update(dt, data = null) {
        super.update(dt, data);
        if (!this.done && data['player'].collCheck(this, data['gameXPos'])) {
            data['player'].addVel(100);
            this.done = true;
        }
    }
    draw(context, xOffset = 0) {
        if (ShotSwap.blink) {
            drawHitFrame(context, this, SpeedBoost.img, xOffset);
        }
        else {
            context.drawImage(SpeedBoost.img,
                this.x - xOffset - SpeedBoost.img.width * 0.5,
                this.y - SpeedBoost.img.height * 0.5);
        }
    }
};
SpeedBoost.img = getImg('./images/items/SpeedBoost.png');