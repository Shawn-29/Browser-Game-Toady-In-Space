import {Enemy} from './base_enemy.js';
import {Shot} from '../shots/shot_base.js';
import {TileMgr, TILE_TYPES, checkTileBits} from '../tile_mgr.js';
import {Timer} from '../timer.js';

import {drawHitFrame, getImg, getTimestamp} from '../utilities.js';

import {BASE_MOVE_VEL, LEVEL_HEIGHT} from '../gameplay_constants.js';

export const DomesworthV2 = class extends Enemy {
    constructor(x, y) {
        super(40, 56, 46, x, y);
        this.shots = Array.from({length: 5}, () => new Shot(30, 30, -999, -999));
        const vel = BASE_MOVE_VEL * .75;
        this.shots[0].vel = [-vel, 0];
        this.shots[1].vel = [-vel, -vel];
        this.shots[2].vel = [0, -vel];
        this.shots[3].vel = [vel, -vel];
        this.shots[4].vel = [vel, 0];
        this.shotDelay = new Timer(3.4, function() {
            for (let s of this.shots) {
                s.setPos(this.x, this.y);
                s.fired = true;
            }
        }.bind(this), true).start();
        this.animIndex = 0;
    }
    update(dt, data = null) {
        super.update(dt, data);
        
        let yM = (BASE_MOVE_VEL >> 1) * dt;

        if (this.bot + yM >= LEVEL_HEIGHT) {
            this.landed = true;
            this.move(0, LEVEL_HEIGHT - this.bot);
        }
        else {
            let lb = TileMgr.get().getPointTileType(this.left, this.bot + yM),
                rb = TileMgr.get().getPointTileType(this.right, this.bot + yM);

            let result = checkTileBits(lb, rb);
            if (result & TILE_TYPES['TILE_WALL']) {
                this.landed = true;
                this.move(0, Math.trunc((this.bot) / TILE_SIZE + 1) * TILE_SIZE - this.bot - 1);
            }
            else {
                this.move(0, yM);
            }
        }
        
        this.shotDelay.update(dt);
        for (let s of this.shots) {
            if (s.fired) {
                s.move(s.vel[0] * dt, s.vel[1] * dt);
                if (data['player'].collCheck(s, data['gameXPos'])) {
                    s.fired = false;
                    data['player'].setHp(25);
                }
            }
        }
        if (data['player'].collCheck(this, data['gameXPos'])) {
            data['player'].setHp(25);
        }
        this.animIndex = getTimestamp() & 0x1;
    }
    draw(context, xOffset = 0) {
        for (let s of this.shots) {
            if (s.fired)
                context.drawImage(DomesworthV2.imgShots[this.animIndex], s.x - xOffset - (DomesworthV2.imgShots[0].width >> 1),
                                 s.y - (DomesworthV2.imgShots[0].height >> 1));
        }
        
        if (this.blinkTimer.started) {
            drawHitFrame(context, this, DomesworthV2.img, xOffset);
        }
        else {
            context.drawImage(DomesworthV2.img,
                              this.x - xOffset - (DomesworthV2.img.width >> 1),
                              this.y - (DomesworthV2.img.height >> 1));          
        }
    }
    getImg() {
        return DomesworthV2.img;
    }
};
DomesworthV2.img = getImg('./images/enemies/DomesworthV2.png');
DomesworthV2.imgShots = [
    getImg('./images/enemies/DomesworthV2ShotA.png'),
    getImg('./images/enemies/DomesworthV2ShotB.png')
];