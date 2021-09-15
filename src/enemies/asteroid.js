import {Enemy} from './base_enemy.js';

import {drawHitFrame, getImg} from '../utilities.js';

export const Asteroid = class extends Enemy {
    constructor(x, y, size, xVel = 0, yVel = 0) {
        switch (size) {
            case 'lg':
                super(60, Asteroid.imgs[0].width * 0.9, Asteroid.imgs[0].height * 0.9, x, y);
                this.animIndex = 0;               
                break;
            case 'sm':
                super(20, Asteroid.imgs[1].width, Asteroid.imgs[1].height, x, y);
                this.animIndex = 1;               
                break;
            case 'in':
            default:
                super(20, Asteroid.imgs[2].width, Asteroid.imgs[2].height, x, y);
                this.animIndex = 2;
                this.setHp = function(amt) {
                    return true;
                }
                break;                
        }

        this.xVel = xVel;
        this.yVel = yVel;
    }
    update(dt, data = null) {
        super.update(dt, data);
        
        this.move(this.xVel * dt, this.yVel * dt);
        
        if (data['player'].collCheck(this, data['gameXPos'])) {
            data['player'].setHp(!this.animIndex ? 30 : 20);
        }
    }
    draw(context, xOffset = 0) {
        if (this.blinkTimer.started) {
            drawHitFrame(context, this, Asteroid.imgs[this.animIndex], xOffset);
        }
        else {
            context.drawImage(Asteroid.imgs[this.animIndex],
                             this.x - xOffset - Asteroid.imgs[this.animIndex].width * 0.5,
                             this.y - Asteroid.imgs[this.animIndex].height * 0.5);
        }        
    }
    getImg() {
        return Asteroid.imgs[this.animIndex];
    }
};
Asteroid.imgs = [
    getImg('./images/enemies/AsteroidLg.png'),
    getImg('./images/enemies/AsteroidSm.png'),
    getImg('./images/enemies/AsteroidSmInvuln.png')
];