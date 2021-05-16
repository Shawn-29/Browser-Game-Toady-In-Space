import {Rect} from '../rect.js';
import {Shot} from './shot_base.js';
import {TileMgr, checkTileBits, TILE_TYPES} from '../tile_mgr.js';

import {getImg} from '../utilities.js';

import {BASE_MOVE_VEL, CANVAS_BASE_HEIGHT, CANVAS_BASE_WIDTH} from '../gameplay_constants.js';

export const ShotLazer = class extends Shot {
    constructor() {
        super(20, 60);
        
        this.vel[0] = BASE_MOVE_VEL * 2;
        this.split = false;
        this.lazerSm = [new Rect(ShotLazer.imgs[1].width, ShotLazer.imgs[1].height),
                       new Rect(ShotLazer.imgs[1].width, ShotLazer.imgs[1].height)];
    }
    update(dt, data = null) {
        if (this.split) {
            let yM = this.vel[0] * dt;
            
            if (this.lazerSm[0].fired) {
                if (this.lazerSm[0].top <= 0) {
                    this.lazerSm[0].fired = false;
                }
                else {
                    let xOffset = data['gameXPos'];
                    if (checkTileBits(TileMgr.get().getPointTileType(this.lazerSm[0].x + xOffset, this.lazerSm[0].top + yM)) & TILE_TYPES['TILE_WALL']) {
                        this.lazerSm[0].fired = false;
                    }
                    else {
                        for (let e of data['enemyList']) {
                            //if (this.lazerSm[0].collCheck(e, xOffset) && e.setHp(ShotLazer.power >> 1, data)) {
                            if (e.collCheck(this.lazerSm[0], xOffset) && e.setHp(ShotLazer.power >> 1, data)) {
                                this.lazerSm[0].fired = false;
                                break;
                            }
                        }
                    }
                }
                this.lazerSm[0].move(0, -yM);
            }
            
            if (this.lazerSm[1].fired) {
                if (this.lazerSm[1].bot >= CANVAS_BASE_HEIGHT) {
                    this.lazerSm[1].fired = false;
                }
                else {
                    let xOffset = data['gameXPos'];
                    if (checkTileBits(TileMgr.get().getPointTileType(this.lazerSm[1].x + xOffset, this.lazerSm[1].bot + yM)) & TILE_TYPES['TILE_WALL']) {
                        this.lazerSm[1].fired = false;
                    }
                    else {
                        for (let e of data['enemyList']) {
                            //if (this.lazerSm[1].collCheck(e, xOffset) && e.setHp(ShotLazer.power >> 1, data)) {
                            if (e.collCheck(this.lazerSm[1], xOffset) && e.setHp(ShotLazer.power >> 1, data)) {
                                this.lazerSm[1].fired = false;
                                break;
                            }
                        }
                    }                    
                }
                this.lazerSm[1].move(0, yM);
            }
            
            if (!this.lazerSm[0].fired && !this.lazerSm[1].fired) {
                this.fired = false;
                this.split = false;
            }
        }
        else if (this.fired) {
            let xM = this.vel[0] * dt;
            if (this.left >= CANVAS_BASE_WIDTH) {
                this.fired = false;
            }
            else {
                let xOffset = data['gameXPos'];
                if (checkTileBits(TileMgr.get().getPointTileType(this.right + xOffset, this.top),
                                 TileMgr.get().getPointTileType(this.right + xOffset, this.bot)) & TILE_TYPES['TILE_WALL']) {
                    this.splitLazer();
                }
                else {
                    for (let e of data['enemyList']) {
                        //if (this.collCheck(e, xOffset) && e.setHp(ShotLazer.power, data)) {
                        if (e.collCheck(this, xOffset) && e.setHp(ShotLazer.power, data)) {
                            this.splitLazer();
                            break;
                        }
                    }               
                }
            }
            this.move(xM, 0);
        }
    }
    draw(context, xOffset = 0) {
        if (this.fired) {
            if (this.split) {
                for (let s of this.lazerSm) {
                    if (s.fired) {
                        context.drawImage(
                            ShotLazer.imgs[1],
                            s.x - ShotLazer.imgs[1].width * 0.5,
                            s.y - ShotLazer.imgs[1].height * 0.5
                        );
                    }
                }
            }
            else {
                context.drawImage(ShotLazer.imgs[0],
                                  this.x - ShotLazer.imgs[0].width * 0.5,
                                  this.y - ShotLazer.imgs[0].height * 0.5);
                //super.draw(context);
            }
        }
    }
    splitLazer() {
        this.split = true;
        for (let s of this.lazerSm) {
            s.setPos(this.right - ShotLazer.imgs[1].width - 1, this.y);
            s.fired = true;
        }        
    }
    static getShotLimit() { return 1; }
    static getDelay() { return 1.2 }
};
ShotLazer.power = 20;
ShotLazer.imgs = [
    getImg('./images/weapons/ShotLazerA.png'),
    getImg('./images/weapons/ShotLazerB.png')
];
ShotLazer.imgIcon = getImg('./images/icons/IconLazer.png');