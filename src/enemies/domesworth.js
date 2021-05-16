import {Enemy} from './base_enemy.js';
import {Shot} from '../shots/shot_base.js';
import {TileMgr, checkTileBits, TILE_SIZE, TILE_TYPES} from '../tile_mgr.js';
import {Timer} from '../timer.js';

import {drawHitFrame, getImg} from '../utilities.js';

import {BASE_MOVE_VEL, LEVEL_HEIGHT} from '../gameplay_constants.js';

export const Domesworth = class extends Enemy {
    constructor(x, y) {
        super(20, 56, 46, x, y);
        this.landed = false;
        this.shot = new Shot(20, 40, 40, -999, -999);
        this.shotDelay = new Timer(3.6, null, false);
        this.shotDelay.start(2);
    }
    update(dt, data = null) {
        super.update(dt, data);
        
        //if (!this.landed) {
            let yM = BASE_MOVE_VEL * dt;
            
            if (this.bot + yM >= LEVEL_HEIGHT) {
                this.landed = true;
                this.move(0, LEVEL_HEIGHT - this.bot);
            }
            else {
                let lb = TileMgr.get().getPointTileType(this.left, this.bot + yM),
                    xb = TileMgr.get().getPointTileType(this.x, this.bot + yM),
                    rb = TileMgr.get().getPointTileType(this.right, this.bot + yM);

                let result = checkTileBits(lb, xb, rb);
                if (result & TILE_TYPES['TILE_WALL']) {
                    this.landed = true;
                    this.move(0, Math.trunc((this.bot) / TILE_SIZE + 1) * TILE_SIZE - this.bot - 1);
                }
                else {
                    this.move(0, yM);
                }
            }
        //}
        
        this.shotDelay.update(dt, data);
        if (this.shotDelay.done) {
            this.shotDelay.start();
            
            let angle = Math.atan2(data['player'].y - this.y,
                                   data['player'].x + data['gameXPos'] - this.x);
            this.shot.vel[0] = Math.round(Math.cos(angle) * 180);
            this.shot.vel[1] = Math.round(Math.sin(angle) * 180);
            this.shot.fire(this.x, this.y);
            //this.shot.setPos(this.x, this.y);
        }
        this.shot.update(dt, data);
        
        if (data['player'].collCheck(this, data['gameXPos']) || data['player'].collCheck(this.shot, data['gameXPos'])) {
            data['player'].setHp(20);
        }
    }
    draw(context, xOffset = 0) {
        
        context.drawImage(Domesworth.imgShot,
                         this.shot.x - xOffset - Domesworth.imgShot.width * 0.5,
                          this.shot.y - Domesworth.imgShot.height * 0.5);
        
        if (this.blinkTimer.started) {
            drawHitFrame(context, this, Domesworth.img, xOffset);
        }
        else {
            context.drawImage(Domesworth.img,
                              this.x - xOffset - Domesworth.img.width * 0.5,
                              this.y - Domesworth.img.height * 0.5);          
        }
    }
};
// Domesworth.img = getImg('Images/Enemies/Domesworth.png');
// Domesworth.imgShot = getImg('Images/Enemies/DomesworthShot.png');
Domesworth.img = getImg('./images/enemies/Domesworth.png');
Domesworth.imgShot = getImg('./images/enemies/DomesworthShot.png');