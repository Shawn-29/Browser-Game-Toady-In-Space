import {Item} from './item_base.js';
import {ShotSwap} from './shot_swap.js';

import {drawHitFrame, getImg} from '../utilities.js';

export const BombRefill = class extends Item {
    constructor(x, y) {
        super(BombRefill.img.width, BombRefill.img.height, x, y);
    }
    update(dt, data = null) {
        super.update(dt, data);
        if (!this.done && data['player'].collCheck(this, data['gameXPos'])) {
            data['player'].addBomb(3);
            this.done = true;
        }
    }
    draw(context, xOffset = 0) {
        if (ShotSwap.blink) {
            drawHitFrame(context, this, BombRefill.img, xOffset);
        }
        else {
            context.drawImage(BombRefill.img,
                             this.x - xOffset - BombRefill.img.width * 0.5,
                             this.y - BombRefill.img.height * 0.5);
        }
    }
};
// BombRefill.img = getImg('Images/Items/BombRefill.png');
BombRefill.img = getImg('./images/items/BombRefill.png');