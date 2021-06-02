import {CoinG} from './coin_green.js';
import {Item} from './item_base.js';

import {getImg} from '../utilities.js';

import {SCORE_SHEET} from '../score_sheet.js';

export const CoinR = class extends Item {
    constructor(x, y) {
        super(CoinR.imgs[0].width, CoinR.imgs[0].height, x, y);
    }
    update(dt, data = null) {
        super.update(dt, data);
        if (!this.done && data['player'].collCheck(this, data['gameXPos'])) {
            data['player'].tempScore += SCORE_SHEET[this.constructor.name];
            data['player'].setHp(-20);
            this.done = true;
        }
    }
    draw(context, xOffset = 0) {
        context.drawImage(CoinR.imgs[CoinG.animIndex],
                         this.x - xOffset - CoinR.imgs[CoinG.animIndex].width * 0.5,
                         this.y - CoinR.imgs[CoinG.animIndex].height * 0.5);        
    }
};
CoinR.imgs = [
    getImg('./images/items/CoinR1.png'),
    getImg('./images/items/CoinR2.png'),
    getImg('./images/items/CoinR3.png'),
    getImg('./images/items/CoinR4.png')
];