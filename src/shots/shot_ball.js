import {ExpMgr} from '../explosion_mgr.js';
import {Shot} from './shot_base.js';
import {TileMgr, checkTileBits, TILE_TYPES} from '../tile_mgr.js';
import {Timer} from '../timer.js';

import {getImg} from '../utilities.js';

import {BASE_MOVE_VEL, CANVAS_BASE_WIDTH, LEVEL_HEIGHT} from '../gameplay_constants.js';

export const ShotBall = class extends Shot {
    constructor() {
        super(40, 40);
        this.hits = 0;
        this.sparkX = this.sparkY = 0;
        this.sparkTimer = new Timer(.1, function() {
            this.sparkX = this.x;
            this.sparkY = this.y;
        }.bind(this), true).start();
    }
    update(dt, data = null) {
        if (this.fired) {
            this.sparkTimer.update(dt);
            
            if (this.right >= CANVAS_BASE_WIDTH) {
                this.setPos(CANVAS_BASE_WIDTH - (ShotBall.img.width >> 1), this.y);
                this.reverseX();
            }
            else if (this.left <= 0) {
                this.setPos(ShotBall.img.width, this.y);
                this.reverseX();
            }
            
            if (this.bot >= LEVEL_HEIGHT) {
                this.setPos(this.x, LEVEL_HEIGHT - (ShotBall.img.height >> 1));
                this.reverseY();
            }
            else if (this.top <= 0) {
                this.setPos(this.x, ShotBall.img.height);
                this.reverseY();
            }

            let xM = ~~(this.vel[0] * dt);
            let yM = ~~(this.vel[1] * dt);
            
            let xOffset = data['gameXPos'];           
            
            let rTileOffset = this.right + xOffset + xM,
                lTileOffset = this.left + xOffset + xM;
            
            if (checkTileBits(TileMgr.get().getPointTileType(rTileOffset, this.top),
                                      TileMgr.get().getPointTileType(rTileOffset, this.bot),
                                      TileMgr.get().getPointTileType(lTileOffset, this.top),
                                      TileMgr.get().getPointTileType(lTileOffset, this.bot)) & TILE_TYPES['TILE_WALL']) {
                this.reverseX();
                xM = ~~(this.vel[0] * dt);
            }
            
            rTileOffset += xM;
            lTileOffset += xM;
            
            if (checkTileBits(TileMgr.get().getPointTileType(rTileOffset, this.top + yM),
                                      TileMgr.get().getPointTileType(rTileOffset, this.bot + yM),
                                      TileMgr.get().getPointTileType(lTileOffset, this.top + yM),
                                      TileMgr.get().getPointTileType(lTileOffset, this.bot + yM)) & TILE_TYPES['TILE_WALL']) {
                this.reverseY();
                yM = ~~(this.vel[1] * dt);
            }
            
            if (this.hits > 30) {
                this.fired = false;
                ExpMgr.get().addExp(this.x, this.y);
                return;
            }
            
            for (let e of data['enemyList']) {
                if (e.collCheck(this, xOffset)) {
                    e.setHp(ShotBall.power + this.hits, data);
                    
                    if ((this.x + xOffset > e.x && Math.sign(this.vel[0]) == -1) ||
                       ((this.x + xOffset <= e.x && Math.sign(this.vel[0]) == 1))) {
                        this.reverseX();
                        xM = ~~(this.vel[0] * dt);
                    }
                    if ((this.y > e.x && Math.sign(this.vel[1]) == -1) ||
                       ((this.y <= e.x && Math.sign(this.vel[1]) == 1))) {
                        this.reverseY();
                        yM = ~~(this.vel[1] * dt);
                    }
                    break;
                }
            }
            
            this.move(xM, yM);
        }
    }
    draw(context, xOffset = 0) {
        if (this.fired) {
            
                context.drawImage(ShotBall.imgSpark,
                                  this.sparkX - (ShotBall.imgSpark.width >> 1) - 10,
                                  this.sparkY - (ShotBall.imgSpark.height >> 1) - 5);
                context.drawImage(ShotBall.imgSpark,
                                  this.sparkX - (ShotBall.imgSpark.width >> 1) + 10,
                                  this.sparkY - (ShotBall.imgSpark.height >> 1));
                context.drawImage(ShotBall.imgSpark,
                                  this.sparkX - (ShotBall.imgSpark.width >> 1) - 10,
                                  this.sparkY - (ShotBall.imgSpark.height >> 1) + 5);
            
            for (let i = 3; i > 1; --i) {
                context.drawImage(ShotBall.imgSpark,
                                  this.sparkX - (12 * i * Math.sign(this.vel[0])) - (ShotBall.imgSpark.width >> 1),
                                  this.sparkY - (12 * i * Math.sign(this.vel[1])) - (ShotBall.imgSpark.height >> 1));
            }
            
            context.drawImage(ShotBall.img,
                              this.x - (ShotBall.img.width >> 1),
                              this.y - (ShotBall.img.height >> 1));
        }
    }
    fire(x, y) {
        super.fire(x, y);
        this.sparkX = this.x;
        this.sparkY = this.y;
        this.vel[0] = BASE_MOVE_VEL;
        this.vel[1] = BASE_MOVE_VEL;
        this.hits = 0;
    }
    reverseX() {
        ++this.hits;
        this.vel[0] = -this.vel[0] - Math.sign(this.vel[0]) * 10;
        this.vel[1] = this.vel[1] + Math.sign(this.vel[1]) * 10;
    }
    reverseY() {
        ++this.hits;
        this.vel[0] = this.vel[0] + Math.sign(this.vel[0]) * 10;
        this.vel[1] = -this.vel[1] - Math.sign(this.vel[1]) * 10;
    }
    static getShotLimit() { return 1; }
    static getDelay() { return 2; }
};
ShotBall.power = 15;
ShotBall.img = getImg('./images/shots/ShotBall.png');
ShotBall.imgSpark = getImg('./images/shots/Sparkle.png');
ShotBall.imgIcon = getImg('./images/icons/IconBall.png');