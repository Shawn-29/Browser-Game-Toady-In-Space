import {Enemy} from './base_enemy.js';
import {Shot} from '../shots/shot_base.js';
import {Timer} from '../timer.js';

import {drawHitFrame, getImg} from '../utilities.js';

import {BASE_MOVE_VEL, LEVEL_HEIGHT, RAD_2_DEGS} from '../gameplay_constants.js';

export class VectorToad extends Enemy {
    constructor(x, y) {
        super(40, 78, 36, x, y);
        this.shot = new Shot(30, 16, -1, -1);
        this.shot.vel[0] = -BASE_MOVE_VEL * 1.5;
        this.shotDelay = new Timer(1, null, false);
        this.shotDelay.start();
        
        this.ang = 0;
    }
    update(dt, data = null) {
        super.update(dt, data);
        
        this.shotDelay.update(dt);
        if (this.shotDelay.done) {
            if (!this.shot.fired) {
                this.shot.fire(this.left, this.bot);
                this.shotDelay.start();
            }
        }

        if (this.shot.right - data['gameXPos'] < 0) {
            this.shot.fired = false;
        }
        this.shot.update(dt);
        
        let xM = 0,
            yM = 0;
        
        if (this.top <= data['player'].top - 50) {
            yM = VectorToad.vel;
        }
        else if (this.bot >= data['player'].bot + 40) {
            yM = -VectorToad.vel;
        }
        else {
            this.ang += 5;
            if (this.ang > 360) {
                this.ang = 0;
            }
            xM = Math.sin((RAD_2_DEGS * this.ang)) * VectorToad.vel;
            yM = Math.cos((RAD_2_DEGS * this.ang)) * VectorToad.vel * 1;
        }
        
        if (this.top + yM <= 0) {
            yM = -this.top;
        }
        else if (this.bot + yM >= LEVEL_HEIGHT) {
            yM = LEVEL_HEIGHT - this.bot;
        }
        
        this.move((xM - 5) * dt, yM * dt);
        
        if (data['player'].collCheck(this.shot, data['gameXPos'])) {
            data['player'].setHp(20);
            this.shot.fired = false;
        }
        else if (data['player'].collCheck(this.shot, data['gameXPos'])) {
            data['player'].setHp(20);            
        }
    }
    draw(context, xOffset = 0) {
        if (this.shot.fired)
            context.drawImage(VectorToad.imgShot,
                              this.shot.x - xOffset - VectorToad.imgShot.width * 0.5,
                              this.shot.y - VectorToad.imgShot.height * 0.5);
        
        if (this.blinkTimer.started) {
            drawHitFrame(context, this, VectorToad.img, xOffset);
        }
        else {
            context.drawImage(VectorToad.img,
                             this.x - xOffset - VectorToad.img.width * 0.5,
                             this.y - VectorToad.img.height * 0.5);
        }
    }
    getImg() {
        return VectorToad.img;
    }
};
VectorToad.img = getImg('./images/enemies/VectorToad.png');
VectorToad.imgShot = getImg('./images/enemies/VectorToadShot.png');
VectorToad.vel = BASE_MOVE_VEL * 0.4;