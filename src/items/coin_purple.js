import {Item} from './item_base.js';
import {CoinG} from './coin_green.js';

import {getImg} from '../utilities.js';

import {SCORE_SHEET} from '../score_sheet.js';

export const CoinP = class extends Item {
    constructor(x, y) {
        super(CoinP.imgs[0].width, CoinP.imgs[0].height, x, y);
    }
    update(dt, data = null) {
        super.update(dt, data);
        if (!this.done && data['player'].collCheck(this, data['gameXPos'])) {
            data['player'].tempScore += SCORE_SHEET[this.constructor.name];
            data['player'].addVel(200);
            this.done = true;
        }
    }
    draw(context, xOffset = 0) {
        context.drawImage(CoinP.imgs[CoinG.animIndex],
                         this.x - xOffset - CoinP.imgs[CoinG.animIndex].width * 0.5,
                         this.y - CoinP.imgs[CoinG.animIndex].height * 0.5);        
    }
};
// CoinP.imgs = [
//     getImg('Images/Items/CoinP1.png'),
//     getImg('Images/Items/CoinP2.png'),
//     getImg('Images/Items/CoinP3.png'),
//     getImg('Images/Items/CoinP4.png')
// ];
CoinP.imgs = [
    getImg('./images/items/CoinP1.png'),
    getImg('./images/items/CoinP2.png'),
    getImg('./images/items/CoinP3.png'),
    getImg('./images/items/CoinP4.png')
];