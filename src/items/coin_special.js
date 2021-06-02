import {Item} from './item_base.js';
import {CoinG} from './coin_green.js';

import {getImg} from '../utilities.js';

import {SCORE_SHEET} from '../score_sheet.js';

export const CoinS = class extends Item {
    constructor(x, y) {
        super(CoinS.imgs[0].width, CoinS.imgs[0].height, x, y);
    }
    update(dt, data = null) {
        super.update(dt, data);
        if (!this.done && data['player'].collCheck(this, data['gameXPos'])) {
            data['player'].tempScore += SCORE_SHEET[this.constructor.name];
            data['player'].makeInvulnerable();
            this.done = true;
        }
    }
    draw(context, xOffset = 0) {
        context.drawImage(CoinS.imgs[CoinG.animIndex],
                         this.x - xOffset - CoinS.imgs[CoinG.animIndex].width * 0.5,
                         this.y - CoinS.imgs[CoinG.animIndex].height * 0.5);        
    }
};
CoinS.imgs = [
    getImg('./images/items/CoinS1.png'),
    getImg('./images/items/CoinS2.png'),
    getImg('./images/items/CoinS3.png'),
    getImg('./images/items/CoinS4.png')
];