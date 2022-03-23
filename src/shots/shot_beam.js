import { Rect } from '../rect.js';
import { Shot } from './shot_base.js';
import { Timer } from '../timer.js';

import { getImg } from '../utilities.js';

import { CANVAS_BASE_WIDTH } from '../gameplay_constants.js';

export const ShotBeam = class extends Shot {
    constructor() {
        /* beam width depends on player distance from right side of screen */
        super(2.5, 100, -1, -1);
        this.accum = 0;
        this.step = false;
        this.timer = new Timer(2, function () {
            this.accum = 0;
        }.bind(this), false);
    }
    update(dt, data = null) {
        this.timer.update(dt);
        if (this.fired) {
            if (this.timer.done) {
                this.setPos(data['player'].right + (this.right - this.left >> 1),
                    data['player'].y + 18);
                this.setBounds(CANVAS_BASE_WIDTH - this.left, this.accum);
                if (!this.step) {
                    this.accum += 7;
                    if (this.accum >= ShotBeam.imgs[0].height) {
                        this.step = true;
                    }
                }
                else {
                    this.accum -= 7;
                    if (this.accum <= 0) {
                        this.fired = false;
                    }
                }
                let xOffset = data['gameXPos'];
                for (let e of data['enemyList']) {
                    if (e.collCheck(this, xOffset) || Rect.checkPointsAgainst(e, this, xOffset)) {
                        e.setHp(ShotBeam.power, data);
                    }
                }
            }
            else {
                this.setPos(data['player'].x, data['player'].y);
                ++this.accum;
            }
        }
    }
    draw(context, xOffset = 0) {
        if (this.fired) {
            if (this.timer.done) {
                context.drawImage(ShotBeam.imgs[0], this.left, this.y - (this.bot - this.top >> 1),
                    ShotBeam.imgs[0].width, this.bot - this.top);
                context.drawImage(ShotBeam.imgs[1], this.left + ShotBeam.imgs[0].width, this.y - (this.bot - this.top >> 1),
                    this.right - this.left, this.bot - this.top);
            }
            else {
                if (this.accum & 0x2)
                    context.drawImage(ShotBeam.imgs[2], this.x - (ShotBeam.imgs[2].width >> 1), this.y - (ShotBeam.imgs[2].height >> 1));
            }
            /* debug - draw beam collision bounds */
            // context.save();
            // context.fillStyle = 'rgba(255,0,0,.6)';
            // context.fillRect(this.left, this.top, this.right - this.left, this.bot - this.top);
            // context.restore();
        }
    }
    fire(x, y) {
        if (!this.fired) {
            this.accum = 0;
            this.step = false;
            this.fired = true;
            this.timer.start();
            this.setBounds(ShotBeam.imgs[2].width, ShotBeam.imgs[2].height);
        }
    }
};
ShotBeam.power = 10;
ShotBeam.imgs = [
    getImg('./images/shots/BeamA.png'),
    getImg('./images/shots/BeamB.png'),
    getImg('./images/player/ChargeUp.png')
];
ShotBeam.imgIcon = getImg('./images/icons/IconBeam.png');