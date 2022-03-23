import { Rect } from '../rect.js';
import { Shot } from './shot_base.js';
import { TileMgr, checkTileBits, TILE_TYPES } from '../tile_mgr.js';
import { Timer } from '../timer.js';

import { drawImgR, getImg, randInt } from '../utilities.js';

import { BASE_MOVE_VEL, CANVAS_BASE_WIDTH } from '../gameplay_constants.js';

export const ShotFreeze = class extends Shot {
    constructor() {
        super(20, 20);
        this.vel[0] = BASE_MOVE_VEL * 1.25;
        this.iceCubes = new Set();

        this.animAng = 0;
        this.animIndex = 0;
        this.animTimer = new Timer(.12, () => {
            this.animAng = this.animAng > 360 ? 0 : this.animAng + 60;
            if (++this.animIndex >= IceCube.imgs.length) {
                this.animIndex = 0;
            }
        }, true).start();
    }
    addIceCube(enemy) {
        const newCube = new IceCube(this, enemy);
        this.iceCubes.add(newCube);
    }
    draw(context, xOffset = 0) {
        if (this.fired) {
            drawImgR(
                context,
                ShotFreeze.img,
                this.x - (this.width >>> 1),
                this.y - (this.height >>> 1),
                this.width,
                this.height,
                this.animAng
            );
        }

        /* debug - uncomment to display collision drawing */
        // Rect.prototype.draw.call(this, context, xOffset);

        for (const cube of this.iceCubes) {
            cube.draw(context, xOffset);
        }
    }
    fire(x, y) {
        super.fire(x, y);
        this.animAng = 0;

        this.vel[1] = randInt(-BASE_MOVE_VEL, BASE_MOVE_VEL);
    }
    update(dt, data = null) {

        this.animTimer.update(dt, data);

        for (const cube of this.iceCubes) {
            cube.update(dt, data);
            if (cube.done) {
                this.iceCubes.delete(cube);
            }
        }

        if (!this.fired) {
            return;
        }

        if (this.left >= CANVAS_BASE_WIDTH) {
            this.fired = false;
        }
        else {
            const xM = this.vel[0] * dt,
                yM = this.vel[1] * dt,
                xOffset = data['gameXPos'],
                rt = TileMgr.getPointTileType(this.x + xOffset + xM, this.top + yM),
                rb = TileMgr.getPointTileType(this.x + xOffset + xM, this.bot + yM),
                result = checkTileBits(rt, rb);

            if (result & TILE_TYPES['TILE_WALL']) {
                this.fired = false;
            }
            else {
                /* check if the projectile hit an enemy */
                for (const e of data['enemyList']) {
                    if (e.collCheck(this, xOffset) && e.setHp(ShotFreeze.power, data, false)) {
                        this.fired = false;

                        if (e.done) {
                            this.addIceCube(e);
                        }

                        break;
                    }
                }
            }

            this.move(xM, yM);
        }
    }
    static getShotLimit() {
        return 5;
    }
    static getDelay() {
        return .1;
    }
};
ShotFreeze.power = 5;
ShotFreeze.img = getImg('./images/shots/ShotFreeze.png');
ShotFreeze.imgIcon = getImg('./images/icons/IconFreeze.png');

const IceCube = class {
    constructor(owner, enemy) {

        const factor = enemy.width >= enemy.height ?
            enemy.width / IceCube.imgs[0].width + .2 :
            enemy.height / IceCube.imgs[0].height + .2;

        const newWidth = IceCube.imgs[0].width * factor,
            newHeight = IceCube.imgs[0].height * factor;

        this.freezeFrame = enemy.getImg();
        this.power = enemy.maxHp;

        this.bounds = new Rect(newWidth, newHeight, enemy.x, enemy.y);
        this.touched = false;
        this.done = false;

        this.shattered = false;
        this.shatterIndex = 0;
        this.shatterTimer = new Timer(.06, () => {
            if (++this.shatterIndex >= IceCube.shatterImgs.length) {
                this.done = true;
            }
        }, true).start();

        this.xVel = 0;

        this.owner = owner;
    }
    draw(context, xOffset = 0) {

        if (this.shattered) {
            context.drawImage(
                IceCube.shatterImgs[this.shatterIndex],
                this.bounds.x - xOffset - (this.bounds.width >>> 1),
                this.bounds.y - (this.bounds.height >>> 1),
                this.bounds.width,
                this.bounds.height
            );
            return;
        }

        context.globalAlpha = 1;
        context.drawImage(
            IceCube.imgs[this.owner.animIndex],
            this.bounds.x - xOffset - (this.bounds.width >>> 1),
            this.bounds.y - (this.bounds.height >>> 1),
            this.bounds.width,
            this.bounds.height
        );
        context.globalAlpha = 1;
        IceCube.drawFreezeFrame(context, this.bounds, this.freezeFrame, xOffset);
    }
    update(dt, data = null) {
        if (this.done) {
            return;
        }
        else if (this.shattered) {
            this.shatterTimer.update(dt, data);
            return;
        }

        const xOffset = data['gameXPos'],
            xM = this.xVel * dt;

        const rt = TileMgr.getPointTileType(this.bounds.x + xM, this.bounds.y),
            rb = TileMgr.getPointTileType(this.bounds.x + xM, this.bounds.y),
            result = checkTileBits(rt, rb);

        /* check if the cube hit a wall or went off screen */
        if (result & TILE_TYPES['TILE_WALL']) {
            this.shatter();
        }
        else if (this.bounds.right - xOffset <= 0 || this.bounds.left - xOffset >= CANVAS_BASE_WIDTH) {
            this.done = true;
        }
        else if (this.touched) {
            this.bounds.move(xM, 0);
        }
        else {
            this.checkTouch(data['player'], xOffset);
        }

        /* check if the cube hit an enemy */
        for (const e of data['enemyList']) {
            if (e.collCheck(this.bounds, 0) && e.setHp(this.power, data)) {
                this.shatter();
                break;
            }
        }
    }
    checkSlide(other) {
        if (!(other instanceof IceCube) || other === this) {
            return false;
        }

        if (this.touched &&
            this.bounds.collCheck(other.bounds) ||
            other.bounds.collCheck(this.bounds)) {

            other.touched = true;
            other.xVel = this.xVel;

            return true;
        }

        return false;
    }
    checkTouch(rect, xOffset) {
        if (!this.touched &&
            rect.collCheck(this.bounds, xOffset) ||
            this.bounds.collCheck(rect, xOffset)) {

            this.touched = true;
            this.xVel = (rect.x + xOffset <= this.bounds.x ?
                BASE_MOVE_VEL : -BASE_MOVE_VEL) << 1;

            return true;
        }
        return false;
    }
    shatter() {
        this.shattered = true;
    }
    static drawFreezeFrame = (context, bounds, img, xOffset = 0) => {

        const bufferCanvas = document.getElementById("buffer"),
            buffer = bufferCanvas.getContext("2d"),
            left = bounds.x - img.width * .5 - xOffset,
            right = bounds.x + img.width * .5 - xOffset,
            top = bounds.y - img.height * .5,
            bot = bounds.y + img.height * .5;

        buffer.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        buffer.save();
        buffer.fillStyle = 'rgba(0, 0, 255, .5)';
        buffer.fillRect(0, 0, right, bot);
        buffer.globalCompositeOperation = 'destination-atop';
        buffer.drawImage(img, left, top);
        buffer.restore();
        context.drawImage(bufferCanvas, 0, 0);
    };
};
IceCube.imgs = [
    getImg('./images/shots/IceCubeA.png'),
    getImg('./images/shots/IceCubeB.png'),
    getImg('./images/shots/IceCubeC.png'),
];
IceCube.shatterImgs = [
    getImg('./images/shots/ShatterA.png'),
    getImg('./images/shots/ShatterB.png'),
    getImg('./images/shots/ShatterC.png'),
];