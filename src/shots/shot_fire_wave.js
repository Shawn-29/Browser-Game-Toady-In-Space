import {Shot} from './shot_base.js';

import {getImg} from '../utilities.js';

import {ACTION_FIRE} from '../user/player.js';

export const ShotFireWave = class extends Shot {
    constructor() {
        super(80, 34);
        this.fuel = 100;
    }
    update(dt, data = null) {
        if (this.fuel < 50 && !this.fired) {
            ++this.fuel;
            return;
        }
        
        if (data['player'].action & ACTION_FIRE && this.fuel > 0) {
            this.fired = true;
            --this.fuel;
            
            this.setPos(data['player'].right + (this.right - this.left) * 0.6, data['player'].bot);
            
            for (let e of data['enemyList']) {
                //if (this.collCheck(e, data['gameXPos'])) {
                if (e.collCheck(this, data['gameXPos'])) {
                    e.setHp(ShotFireWave.power, data);
                }
            }
        }
        else {
            this.fuel = Math.min(this.fuel + 1, 80);
            this.fired = false;
        }
    }
    draw(context, xOffset = 0) {
        if (this.fired) {
            context.drawImage(ShotFireWave.img,
                              this.x - ShotFireWave.img.width,
                              this.y - ShotFireWave.img.height * Math.random() * 0.4 - 10);
            context.drawImage(ShotFireWave.img,
                              this.x - (ShotFireWave.img.width >> 1),
                              this.y - ShotFireWave.img.height * Math.random() * 0.35 - 10);
            context.drawImage(ShotFireWave.img,
                              this.x,
                              this.y - ShotFireWave.img.height * Math.random() * 0.3 - 10);
        }
    }
    fire(x, y) {
        return;
    }
    static getShotLimit() { return 1; }
    static getDelay() { return 0.01; }    
};
ShotFireWave.power = 6;
ShotFireWave.img = getImg('./images/shots/ShotFireWave.png');
ShotFireWave.imgIcon = getImg('./images/icons/IconFireWave.png');