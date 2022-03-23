import { Enemy } from './base_enemy.js';
import { TileMgr, checkTileBits, TILE_SIZE, TILE_TYPES, LEVEL_HEIGHT } from '../tile_mgr.js';
import { Timer } from '../timer.js';

import { drawHitFrame, getImg } from '../utilities.js';

import { BASE_MOVE_VEL } from '../gameplay_constants.js';

export class Stretcher extends Enemy {
    constructor(x, y) {
        super(20, Stretcher.imgs[1].width, Stretcher.imgs[1].height, x, y);
        this.animIndex = 1;
        this.landed = false;
        this.dir = 0;
        this.leapDelay = new Timer(1.0, function () {
            this.landed = false;
            this.animIndex = 1;
            this.setBounds(Stretcher.imgs[1].width, Stretcher.imgs[1].height);
        }.bind(this), true).start();
    }
    update(dt, data = null) {
        super.update(dt, data);

        if (!this.landed) {
            let yM = 0.0;
            if (this.dir == 0) {
                yM = BASE_MOVE_VEL * dt;
                let lb = TileMgr.getPointTileType(this.left, this.bot + yM),
                    xb = TileMgr.getPointTileType(this.x, this.bot + yM),
                    rb = TileMgr.getPointTileType(this.right, this.bot + yM);
                let result = checkTileBits(lb, xb, rb);
                if (result & TILE_TYPES['TILE_WALL']) {
                    this.land();
                    this.move(0, Math.trunc((this.bot) / TILE_SIZE + 1) * TILE_SIZE - this.bot - 1);
                }
                else if (this.bot + yM >= LEVEL_HEIGHT) {
                    this.land();
                    this.move(0, LEVEL_HEIGHT - this.bot);
                }
            }
            else {
                yM = -BASE_MOVE_VEL * dt;
                let lt = TileMgr.getPointTileType(this.left, this.top + yM),
                    xt = TileMgr.getPointTileType(this.x, this.top + yM),
                    rt = TileMgr.getPointTileType(this.right, this.top + yM);
                let result = checkTileBits(lt, xt, rt);
                if (result & TILE_TYPES['TILE_WALL']) {
                    this.land();
                    this.move(0, Math.trunc((this.top) / TILE_SIZE) * TILE_SIZE - this.top);
                }
                else if (this.top + yM <= 0) {
                    this.land();
                    this.move(0, -this.top);
                }
            }
            this.move(0, yM);
        }
        else {
            this.leapDelay.update(dt);
        }

        if (data['player'].collCheck(this, data['gameXPos'])) {
            data['player'].setHp(20);
        }
    }
    draw(context, xOffset = 0) {
        if (this.blinkTimer.started) {
            drawHitFrame(context, this, Stretcher.imgs[this.animIndex], xOffset);
        }
        else {
            context.drawImage(Stretcher.imgs[this.animIndex],
                this.x - xOffset - Stretcher.imgs[this.animIndex].width * 0.5,
                this.y - Stretcher.imgs[this.animIndex].height * 0.5);
        }
    }
    land() {
        this.landed = true;
        this.animIndex = 0;
        this.setBounds(42, 62);
        this.dir ^= 1;
    }
    getImg() {
        return Stretcher.imgs[this.animIndex];
    }
};
Stretcher.imgs = [
    getImg('./images/enemies/StretcherA.png'),
    getImg('./images/enemies/StretcherB.png')
];