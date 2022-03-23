import { Item } from './item_base.js';
import { Timer } from '../timer.js';

import { drawHitFrame, getImg } from '../utilities.js';

export const ShotSwap = class extends Item {
    constructor(x, y) {
        super(ShotSwap.imgs[0].width, ShotSwap.imgs[0].height, x, y);
    }
    update(dt, data = null) {
        super.update(dt, data);
        if (!this.done && data['player'].collCheck(this, data['gameXPos'])) {
            switch (ShotSwap.animIndex) {
                case 0: data['player'].setShotType('ShotRegular'); break;
                case 1: data['player'].setShotType('ShotLazer'); break;
                case 2: data['player'].setShotType('ShotFireWave'); break;
                case 3: data['player'].setShotType('ShotCutter'); break;
                case 4: data['player'].setShotType('ShotFreeze'); break;
            }
            this.done = true;
        }
    }
    draw(context, xOffset = 0) {
        if (ShotSwap.blink) {
            drawHitFrame(context, this, ShotSwap.imgs[ShotSwap.animIndex], xOffset);
        }
        else {
            context.drawImage(ShotSwap.imgs[ShotSwap.animIndex],
                this.x - xOffset - ShotSwap.imgs[ShotSwap.animIndex].width * 0.5,
                this.y - ShotSwap.imgs[ShotSwap.animIndex].height * 0.5);
        }
    }
};
ShotSwap.imgs = [
    getImg('./images/items/ShotSwap1.png'),
    getImg('./images/items/ShotSwap2.png'),
    getImg('./images/items/ShotSwap3.png'),
    getImg('./images/items/ShotSwap4.png'),
    getImg('./images/items/ShotSwap5.png')
];
ShotSwap.animIndex = 0;
ShotSwap.blink = false;
ShotSwap.timer = new Timer(1.0, () => {
    if (!ShotSwap.blink) {
        ShotSwap.blink = true;
        ShotSwap.timer.start(0.1);
    }
    else {
        ShotSwap.blink = false;
        ShotSwap.timer.start(0.9);
        if (++ShotSwap.animIndex >= ShotSwap.imgs.length) {
            ShotSwap.animIndex = 0;
        }
    }
}, false);