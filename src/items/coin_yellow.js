import { Item } from './item_base.js';
import { CoinG } from './coin_green.js';

import { getImg } from '../utilities.js';

import { SCORE_SHEET } from '../score_sheet.js';

export const CoinY = class extends Item {
    constructor(x, y) {
        super(CoinY.imgs[0].width, CoinY.imgs[0].height, x, y);
    }
    update(dt, data = null) {
        super.update(dt, data);
        if (!this.done && data['player'].collCheck(this, data['gameXPos'])) {
            data['player'].tempScore += SCORE_SHEET[this.constructor.name];
            this.done = true;
        }
    }
    draw(context, xOffset = 0) {
        context.drawImage(CoinY.imgs[CoinG.animIndex],
            this.x - xOffset - CoinY.imgs[CoinG.animIndex].width * 0.5,
            this.y - CoinY.imgs[CoinG.animIndex].height * 0.5);
    }
};
CoinY.imgs = [
    getImg('./images/items/CoinY1.png'),
    getImg('./images/items/CoinY2.png'),
    getImg('./images/items/CoinY3.png'),
    getImg('./images/items/CoinY4.png')
];