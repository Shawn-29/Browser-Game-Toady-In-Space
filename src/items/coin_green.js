import {Item} from './item_base.js';
import {Timer} from '../timer.js';

import {getImg} from '../utilities.js';

import {SCORE_SHEET} from '../score_sheet.js';

export const CoinG = class extends Item {
    constructor(x, y) {
        super(CoinG.imgs[0].width, CoinG.imgs[0].height, x, y);
    }
    update(dt, data = null) {
        super.update(dt, data);
        if (!this.done && data['player'].collCheck(this, data['gameXPos'])) {
            data['player'].tempScore += SCORE_SHEET[this.constructor.name];
            this.done = true;
        }
    }
    draw(context, xOffset = 0) {
        context.drawImage(CoinG.imgs[CoinG.animIndex],
                         this.x - xOffset - CoinG.imgs[CoinG.animIndex].width * 0.5,
                         this.y - CoinG.imgs[CoinG.animIndex].height * 0.5);        
    }
};
CoinG.imgs = [
    getImg('./images/items/CoinG1.png'),
    getImg('./images/items/CoinG2.png'),
    getImg('./images/items/CoinG3.png'),
    getImg('./images/items/CoinG4.png')
];
CoinG.animIndex = 0;
CoinG.timer = new Timer(0.16, () => {
    if (++CoinG.animIndex >= CoinG.imgs.length)
        CoinG.animIndex = 0;
}, true);