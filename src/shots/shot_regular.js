import {Shot} from './shot_base.js';
import {TileMgr, checkTileBits, TILE_TYPES} from '../tile_mgr.js';

import {getImg} from '../utilities.js';

import {BASE_MOVE_VEL, CANVAS_BASE_WIDTH} from '../gameplay_constants.js';

export const ShotRegular = class extends Shot {
    constructor() {
        super(30, 16);
        this.vel[0] = BASE_MOVE_VEL * 1.5;
    }
    update(dt, data = null) {
        if (this.fired) {
            
            let xM = this.vel[0] * dt;
            
            if (this.left >= CANVAS_BASE_WIDTH) {
                this.fired = false;
            }
            else {
                let xOffset = data['gameXPos'];
                
                let rt = TileMgr.get().getPointTileType(this.x + xOffset + xM, this.top),
                    rb = TileMgr.get().getPointTileType(this.x + xOffset + xM, this.bot);
                
                let result = checkTileBits(rt, rb);
                if (result & TILE_TYPES['TILE_WALL']) {
                    this.fired = false;
                }
                else {
                    // check if the projectile hit an enemy
                    for (let e of data['enemyList']) {
                        //if (this.collCheck(e, xOffset) && e.setHp(ShotRegular.power, data)) {
                        if (e.collCheck(this, xOffset) && e.setHp(ShotRegular.power, data)) {                            
                            this.fired = false;
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
            context.drawImage(ShotRegular.img,
                              this.x - ShotRegular.img.width * 0.5,
                              this.y - ShotRegular.img.height * 0.5);
        }
    }
    static getShotLimit() { return 3; }
    static getDelay() { return 0.5; }
};
ShotRegular.power = 10;
ShotRegular.img = getImg('./images/shots/ShotRegular.png');
ShotRegular.imgIcon = getImg('./images/icons/IconRegular.png');