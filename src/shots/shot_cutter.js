import {Item} from '../items/item_base.js';
import {Shot} from './shot_base.js';

import {drawImgR, getImg} from '../utilities.js';

import {RAD_2_DEGS} from '../gameplay_constants.js';

export const ShotCutter = class extends Shot {
    constructor() {
        super(40, 40);
        this.ang = 0;
        this.items = new Set();
    }
    update(dt, data = null) {
        if (this.fired) {
            this.ang += 5;
            if (this.ang >= 360) {
                if (this.x - 10 < data['player'].x) {
                    this.vel[0] = 400;
                }
                else if (this.x + 10 > data['player'].x) {
                    this.vel[0] = -400;
                }
                if (this.y - 10 < data['player'].y) {
                    this.vel[1] = 400;
                }
                else if (this.y + 10 > data['player'].y) {
                    this.vel[1] = -400;
                }
            }
            else {
                this.vel[0] = Math.sin(RAD_2_DEGS * this.ang) * 600;
                this.vel[1] = Math.cos(RAD_2_DEGS * this.ang) * -400;
            }

            if (data['player'].collCheck(this, 0) && this.ang >= 180) {
                this.fired = false;
                this.items.clear();
            }
            this.move(this.vel[0] * dt, this.vel[1] * dt);
            
            for (let i of data['itemList']) {
                if (i instanceof Item) {
                    if (this.collCheck(i, data['gameXPos'])) {
                        this.items.add(i);
                    }
                }
            }
            
            for (let i of this.items) {
                i.setPos(this.x + data['gameXPos'], this.y);
            }
            
            for (let e of data['enemyList']) {
                //if (this.collCheck(e, data['gameXPos'])) {
                if (e.collCheck(this, data['gameXPos'])) {
                    e.setHp(ShotCutter.power, data);
                }
            }
        }
    }
    draw(context, xOffset = 0) {
        if (this.fired) {
            drawImgR(
                context,
                ShotCutter.img,
                this.x - ShotCutter.img.width * 0.5,
                this.y - ShotCutter.img.height * .5,
                this.right - this.left, this.bot - this.top,
                this.ang
            );
        }
    }
    fire(x, y) {
        super.fire(x - 10, y - 10);
        this.ang = 0;
    }
    static getShotLimit() { return 1; }
    static getDelay() { return 2; }
};
ShotCutter.power = 10;
ShotCutter.img = getImg('./images/weapons/ShotCutter.png');
ShotCutter.imgIcon = getImg('./images/icons/IconCutter.png');