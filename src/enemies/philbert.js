import {Enemy} from './base_enemy.js';
import {Timer} from '../timer.js';

import {drawHitFrame, getImg} from '../utilities.js';

import {BASE_MOVE_VEL} from '../gameplay_constants.js';

export const Philbert = class extends Enemy {
    constructor(x, y) {
        super(20, Philbert.imgs[0].width, Philbert.imgs[0].height - 18, x, y);
        this.animIndex = 0;
        this.back = false;
        this.timer = new Timer(.2, function() {
            if (!this.back) {

                if (++this.animIndex >= Philbert.imgs.length) {
                    this.back = true;
                    this.animIndex = Philbert.imgs.length - 2;
                }
            }
            else {
                if (--this.animIndex < 0) {
                    this.back = false;
                    this.animIndex = 1;
                }
            }
        }.bind(this), true);
        this.timer.start();
    }
    update(dt, data = null) {
        super.update(dt, data);
        
        this.timer.update(dt);
        
        this.move(-BASE_MOVE_VEL * 0.25 * dt, 0);
        
        if (data['player'].collCheck(this, data['gameXPos'])) {
            data['player'].setHp(20);
        }
    }
    draw(context, xOffset = 0) {
        if (this.blinkTimer.started) {
            drawHitFrame(context, this, Philbert.imgs[this.animIndex], xOffset);
        }
        else {
            context.drawImage(Philbert.imgs[this.animIndex],
                             this.x - xOffset - Philbert.imgs[this.animIndex].width * 0.5,
                             this.y - Philbert.imgs[this.animIndex].height * 0.5);
        }
    }
};
// Philbert.imgs = [
//     getImg('Images/Enemies/PhilbertA.png'),
//     getImg('Images/Enemies/PhilbertB.png'),
//     getImg('Images/Enemies/PhilbertC.png')
// ];
Philbert.imgs = [
    getImg('./images/enemies/PhilbertA.png'),
    getImg('./images/enemies/PhilbertB.png'),
    getImg('./images/enemies/PhilbertC.png')
];