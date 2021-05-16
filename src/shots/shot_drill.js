import {Shot} from './shot_base.js';
import {TileMgr, checkTileBits, TILE_TYPES} from '../tile_mgr.js';

import {getImg} from '../utilities.js';


export const ShotDrill = class extends Shot {
    constructor() {
        super(64, 44);
        this.animIndex = 0;
        this.timer = new Timer(.06, function() {
            this.animIndex ^= 1;
        }.bind(this), true).start();
    }
    update(dt, data = null) {
        if (this.fired) {
            this.timer.update(dt);

            let xOffset = data['gameXPos'];
            
            for (let e of data['enemyList']) {
                if (e.collCheck(this, xOffset)) {
                    e.setHp(ShotDrill.power, data)
                }
            }
            
            let rt = TileMgr.get().getPointTileType(this.x + xOffset, this.top),
                rb = TileMgr.get().getPointTileType(this.x + xOffset, this.bot);
            if (checkTileBits(rt) & TILE_TYPES['TILE_WALL']) {
                TileMgr.get().setTile(this.x + xOffset, this.top, 0);
            }
            if (checkTileBits(rb) & TILE_TYPES['TILE_WALL']) {
                TileMgr.get().setTile(this.x + xOffset, this.bot, 0);
            }
            
            this.setPos(data['player'].right + 28, data['player'].y + 12);
        }
    }
    draw(context, xOffset = 0) {
        if (this.fired) {
            context.drawImage(ShotDrill.imgs[this.animIndex],
                              this.x - (ShotDrill.imgs[this.animIndex].width >> 1),
                              this.y - (ShotDrill.imgs[this.animIndex].height >> 1));
        }
    }
    static getShotLimit() { return 1; }
    static getDelay() { return 2; }
};
ShotDrill.power = 6;
ShotDrill.imgs = [
    getImg('./images/weapons/ShotDrillA.png'),
    getImg('./images/weapons/ShotDrillB.png')
];
ShotDrill.imgIcon = getImg('./images/icons/IconDrill.png');