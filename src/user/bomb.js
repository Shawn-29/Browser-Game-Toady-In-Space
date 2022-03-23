import { Rect } from '../rect.js';
import { TileMgr, checkTileBits, TILE_SIZE, TILE_TYPES, LEVEL_HEIGHT } from '../tile_mgr.js';
import { Timer } from '../timer.js';

import { getImg } from '../utilities.js';

import { BASE_MOVE_VEL } from '../gameplay_constants.js';

export const Bomb = class extends Rect {
    constructor() {
        super(38, 26);
        this.animIndex = 0;
        this.timer = new Timer(0.08, function () {
            ++this.animIndex;
            if (this.animIndex >= Bomb.imgs.length) {
                this.dropped = false;
                this.exp = false;
            }
            else {
                this.setBounds(Bomb.imgs[this.animIndex].width,
                    Bomb.imgs[this.animIndex].height);
            }
        }.bind(this), true);
        this.reset();
    }
    reset() {
        this.dropped = false;
        this.exp = false;
        this.qty = 5;
    }
    update(dt, data = null) {
        if (this.dropped && !this.exp) {

            let yM = BASE_MOVE_VEL * dt;

            if (this.top + yM >= LEVEL_HEIGHT) {
                this.explode();
                yM = LEVEL_HEIGHT - this.bot;
            }
            else {
                let result = checkTileBits(
                    TileMgr.getPointTileType(this.left, this.bot + yM),
                    TileMgr.getPointTileType(this.x, this.bot + yM),
                    TileMgr.getPointTileType(this.right, this.bot + yM)
                );
                if (result & TILE_TYPES['TILE_WALL']) {
                    this.explode();
                    this.move(0, Math.trunc((this.bot) / TILE_SIZE + 1) * TILE_SIZE - this.bot - 1);
                }
                else {
                    /* check if the bomb hit an enemy */
                    for (const e of data['enemyList']) {
                        if (e.collCheck(this, 0)) {
                            this.explode();
                            break;
                        }
                    }
                }
            }

            this.move(0, yM);
        }
        else if (this.exp) {
            this.timer.update(dt);
            for (let e of data['enemyList']) {
                if (e.collCheck(this, 0)) {
                    e.setHp(20, data, this);
                }
            }
        }
    }
    draw(context, xOffset = 0) {
        if (this.dropped) {
            context.drawImage(
                Bomb.imgs[this.animIndex],
                this.x - xOffset - Bomb.imgs[this.animIndex].width * 0.5,
                this.y - Bomb.imgs[this.animIndex].height * 0.5
            );
        }
    }
    drop(x, y) {
        if (!this.dropped && this.qty > 0) {
            this.dropped = true;
            this.animIndex = 0;
            this.setPos(x, y);
            --this.qty;
        }
    }
    explode() {
        this.timer.start();
        this.animIndex = 1;
        this.exp = true;
    }
};
Bomb.imgs = [
    getImg('./images/shots/BombA.png'),
    getImg('./images/shots/BombB.png'),
    getImg('./images/shots/BombC.png'),
    getImg('./images/shots/BombD.png'),
    getImg('./images/shots/BombC.png'),
    getImg('./images/shots/BombB.png')
];