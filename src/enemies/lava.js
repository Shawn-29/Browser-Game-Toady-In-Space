import {Rect} from '../rect.js';
import {Timer} from '../timer.js';

import {getImg} from '../utilities.js';

import {HAZARD_DMG, LEVEL_HEIGHT} from '../gameplay_constants.js';
import {TILE_SIZE} from '../tile_mgr.js';

export const Lava = class {
    constructor(x, dir = -1) {
        this.done = false;
        this.dir = dir < 0 ? -1 : 1;
        this.accum = 0;
        this.sheets = [];
        this.eruptTimer = new Timer(3.0, function() {
            this.reset();
            this.accum = 0;
        }.bind(this), false);
        for (let i = 0, numSheets = Math.ceil(LEVEL_HEIGHT / (Lava.imgs[0].height - 22) + 1);
            i < numSheets; ++i) {
            this.sheets.push(new Rect(Lava.imgs[0].width, Lava.imgs[0].height, x, 0));
        }
        this.reset();
    }
    update(dt, data = null) {
        if (this.sheets[0].right - data['gameXPos'] <= 0) {
            this.done = true;
            return;
        }
        for (const s of this.sheets) {
            if (data['player'].collCheck(s, data['gameXPos'])) {
                data['player'].setHp(HAZARD_DMG);
            }
            if (this.dir == -1 && s.bot <= 0 && this.accum <= 6) {
                s.setPos(s.x, LEVEL_HEIGHT + (Lava.imgs[0].height - 22) * .5);
                ++this.accum;
            }
            else if (this.dir == 1 && s.top >= LEVEL_HEIGHT + TILE_SIZE && this.accum <= 6) {
                s.setPos(s.x, 0 - (Lava.imgs[0].height - 22) * .5);
                ++this.accum;
            }
            else {
                s.move(0, 400 * this.dir * dt);
            }
        }
        if (this.accum == 6) {
            this.eruptTimer.start();
        }
        else {
            this.eruptTimer.update(dt);
        }
    }
    draw(context, xOffset = 0) {
        for (let s of this.sheets) {
            context.drawImage(Lava.imgs[Lava.animIndex],
                             s.x - xOffset - (Lava.imgs[0].width >> 1),
                             s.y - (Lava.imgs[0].height >> 1));
        }
    }
    collCheck() {
        return false;
    }
    reset() {
        if (this.dir == -1) {
            for (let i = 0, len = this.sheets.length; i < len; ++i) {
                this.sheets[i].setPos(this.sheets[0].x, LEVEL_HEIGHT + TILE_SIZE + (Lava.imgs[0].height - 22) * i);
            }
        }
        else {
            for (let i = 0, len = this.sheets.length; i < len; ++i) {
                this.sheets[i].setPos(this.sheets[0].x, 0 - (Lava.imgs[0].height - 22) * i);
            }           
        }
    }
};
// Lava.imgs = [
//     getImg('Images/Enemies/LavaA.png'), getImg('Images/Enemies/LavaB.png'),
//     getImg('Images/Enemies/LavaC.png'), getImg('Images/Enemies/LavaB.png')
// ];
Lava.imgs = [
    getImg('./images/enemies/LavaA.png'),
    getImg('./images/enemies/LavaB.png'),
    getImg('./images/enemies/LavaC.png'),
    getImg('./images/enemies/LavaB.png')
];

Lava.animIndex = 0;
Lava.animTimer = new Timer(.05, function() {
    if (++Lava.animIndex >= Lava.imgs.length)
        Lava.animIndex = 0;
}, true);