import {Enemy} from './base_enemy.js';
import {Shot} from '../shots/shot_base.js';
import {Timer} from '../timer.js';

import {drawHitFrame, getImg} from '../utilities.js';

import {CANVAS_BASE_WIDTH} from '../gameplay_constants.js';

export class Clinger extends Enemy {
    constructor(x, y) {
        super(40, 44, 60, x, y);
        this.landed = false;
        this.shot = new Shot(100, 20, -999, -999);
        this.shot.vel[0] = -260;
        this.shotDelay = new Timer(4.0, null, false);
        this.shotDelay.start(1.0);
    }
    update(dt, data = null) {
        super.update(dt, data);
        
        this.setPos(CANVAS_BASE_WIDTH - Clinger.img.width * 0.5 + data['gameXPos'], this.y);
        
        this.shotDelay.update(dt, data);
        if (this.shotDelay.done) {
            this.shot.fire(this.x, this.y + 4);
            this.shotDelay.start();
        }

        this.shot.update(dt, data);
        
        if (data['player'].collCheck(this, data['gameXPos']) || data['player'].collCheck(this.shot, data['gameXPos'])) {
            data['player'].setHp(20);
        }
    }
    draw(context, xOffset = 0) {
        context.drawImage(Clinger.imgShot,
                         this.shot.x - xOffset - Clinger.imgShot.width * 0.5,
                          this.shot.y - Clinger.imgShot.height * 0.5);
        
        if (this.blinkTimer.started) {
            drawHitFrame(context, this, Clinger.img, xOffset);
        }
        else {
            context.drawImage(Clinger.img,
                             this.x - xOffset - Clinger.img.width * 0.5,
                             this.y - Clinger.img.height * 0.5);
        }
    }
}
// Clinger.img = getImg('Images/Enemies/Clinger.png');
// Clinger.imgShot = getImg('Images/Enemies/ClingerShot.png');
Clinger.img = getImg('./images/enemies/Clinger.png');
Clinger.imgShot = getImg('./images/enemies/ClingerShot.png');