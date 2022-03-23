import { Bomb } from '../user/bomb.js';
import { Enemy } from './base_enemy.js';
import { ExpMgr } from '../explosion_mgr.js';
import { Rect } from '../rect.js';
import { Shot } from '../shots/shot_base.js';
import { ShotBeam } from '../shots/shot_beam.js';
import { Timer } from '../timer.js';

import { drawImgR, drawHitFrame, getImg, randInt } from '../utilities.js';

import { CANVAS_BASE_WIDTH, EVENT_BOSS_DONE, RAD_2_DEGS } from '../gameplay_constants.js';
import { SCORE_SHEET } from '../score_sheet.js';

export class Boss extends Enemy {
    constructor(x = 0, y = 0) {
        super(400, 270, 270, x, y);
        this.maxHP = this.hp;
        this.blinkTimer.dur = .2;
        this.animIndex = 0;
        this.defeated = false;
        this.hpBar = getImg('./images/enemies/BossHPBar.png');

        this.rects = [
            new Rect(100, 56, x - 8, y - 2),
            new Rect(164, 60, x + 26, y + 104),
            new Rect(240, 48, x + 26, y + 50),
            new Rect(24, 48, x - 106, y + 50)
        ];

        this.anchor = new Shot(60, 62, -1, -1);
        this.anchor.ang = 0;
        this.anchor.accum = 0;
        this.anchor.force = [0, 0];
        this.anchor.update = function (dt, data = null) {
            if (this.fired) {
                if (this.ang <= 180) {
                    this.ang += this.accum;
                    this.vel[0] = Math.sin(RAD_2_DEGS * this.ang) * this.force[0];
                    this.vel[1] = Math.cos(RAD_2_DEGS * this.ang) * this.force[1];
                }
                else {
                    this.vel[1] = 600;
                }
                this.move(this.vel[0] * dt, this.vel[1] * dt);

                if (data['player'].collCheck(this, data['gameXPos'])) {
                    data['player'].setHp(25);
                }
            }
        };
        this.timerAnc = new Timer(4, this.fireAnchor.bind(this), true).start();

        this.mis = new Shot(34, 90, -1, -1);
        this.mis.ang = 0;
        this.mis.timer = new Timer(4, this.fireMissile.bind(this), true).start();
        this.mis.timerWake = new Timer(1.5, null, false);
        this.mis.update = function (dt, data = null) {
            this.timer.update(dt);
            if (this.fired) {
                this.timerWake.update(dt);
                if (this.timerWake.done) {
                    this.ang = 0;
                    if (this.x + 15 < data['player'].x) {
                        this.vel[0] = 150;
                        this.ang = 90;
                    }
                    else if (this.x - 15 > data['player'].x) {
                        this.vel[0] = -150;
                        this.ang = -90;
                    }
                    else {
                        this.vel[0] = 0;
                    }
                    if (this.y + 15 < data['player'].y) {
                        this.vel[1] = 150;
                        this.ang = -180 - (this.ang >> 1);
                    }
                    else if (this.y - 15 > data['player'].y) {
                        this.vel[1] = -150;
                        this.ang = this.ang >> 1;
                    }
                    else {
                        this.vel[1] = 0;
                    }
                }
                this.move(this.vel[0] * dt, this.vel[1] * dt);

                if (data['player'].collCheck(this, data['gameXPos'])) {
                    data['player'].setHp(25);
                    ExpMgr.addExp(data['player'].x - data['gameXPos'] + (this.x - data['player'].x),
                        data['player'].y + (this.y - data['player'].y));
                    this.fired = false;
                }
            }
        }

        this.blast = new Shot(CANVAS_BASE_WIDTH, 120, this.left - CANVAS_BASE_WIDTH * .5, this.y);
        this.blast.segs = Math.ceil((this.blast.right - this.blast.left) / 44);
        this.blast.accum = 0;
        this.step = false;
        this.blast.imgs = [
            getImg('./images/enemies/BlastA_alt.png'),
            getImg('./images/enemies/BlastB_alt.png')
        ];
        this.blast.timer = new Timer(1, function () {
            if (!this.fired) {
                this.fire(this.x, this.y);
                this.timer.dur = .2
                this.accum = 0;
            }
            else if (!this.step) {
                this.step = true;
            }
            else {
                this.fired = false;
                this.step = false;
                this.timer.dur = 1;
                this.timer.repeat = false;
            }
        }.bind(this.blast), true);
        this.blast.update = function (dt, data = null) {
            this.timer.update(dt);
            if (this.fired) {
                this.accum += this.step ? -10 : 10;
                this.setBounds(this.right - this.left, this.accum);
                if (data['player'].collCheck(this, data['gameXPos']))
                    data['player'].setHp(40);
            }
        }

        this.blastTimer = new Timer(1, this.fireBlast.bind(this), true).start();
        this.charging = false;
        this.accum = 0;
    }
    fireBlast() {
        if (this.accum == 0) {
            this.blastTimer.dur = .008;
            ++this.accum;
        }
        else if (this.accum < 150) {
            this.accum += 1;
            if (this.accum & 0x1) {
                this.animIndex = 1;
            }
            else {
                this.animIndex = 0;
            }
        }
        else {
            this.blast.timer.start();
            this.blast.timer.repeat = true;
            this.blastTimer.dur = 6;
            this.accum = 0;
        }
    }
    update(dt, data = null) {
        this.blinkTimer.update(dt);
        if (this.defeated) {

        }
        else {
            this.timerAnc.update(dt);

            this.anchor.update(dt, data);
            this.mis.update(dt, data);
            this.blast.update(dt, data);
            this.blastTimer.update(dt, data);

            for (let r of this.rects) {
                if (r.collCheck(data['player'], data['gameXPos'])) {
                    data['player'].setHp(25);
                }
            }
        }
    }
    draw(context, xOffset = 0) {
        if (this.defeated) {
            context.drawImage(Boss.imgs[this.animIndex],
                this.x - xOffset - Boss.imgs[0].width * 0.5,
                this.y - Boss.imgs[0].height * 0.5);
        }
        else {
            if (this.blinkTimer.started) {
                drawHitFrame(context, this, Boss.imgs[this.animIndex], xOffset);
            }
            else {
                context.drawImage(Boss.imgs[this.animIndex],
                    this.x - xOffset - Boss.imgs[0].width * 0.5,
                    this.y - Boss.imgs[0].height * 0.5);
            }
            if (this.anchor.fired) {
                drawImgR(context, Boss.imgAnc, this.anchor.x - xOffset - Boss.imgAnc.width * .5,
                    this.anchor.y - Boss.imgAnc.height * .5,
                    this.anchor.right - this.anchor.left, this.anchor.bot - this.anchor.top,
                    (-this.anchor.ang << 1));
            }

            if (this.mis.fired) {
                drawImgR(context, Boss.imgMis, this.mis.x - xOffset - Boss.imgMis.width * .5,
                    this.mis.y - Boss.imgMis.height * .5,
                    this.mis.right - this.mis.left, this.mis.bot - this.mis.top,
                    this.mis.ang);
            }

            if (this.blast.fired) {
                context.drawImage(this.blast.imgs[0],
                    this.blast.right - xOffset - this.blast.imgs[0].width,
                    this.blast.y - this.blast.accum * .5,
                    this.blast.imgs[0].width,
                    this.blast.accum);
                for (let i = this.blast.segs - 1; i > 0; --i) {
                    context.drawImage(this.blast.imgs[1],
                        this.blast.right - xOffset - this.blast.imgs[0].width - this.blast.imgs[1].width * i,
                        this.blast.y - this.blast.accum * .5,
                        this.blast.imgs[1].width,
                        this.blast.accum);
                }
            }
            context.drawImage(this.hpBar, 220, 5);
            context.fillStyle = '#fa0';
            context.fillRect(254, 16, this.hp * (144 / this.maxHP), 9);
        }

        /* draw boss collision frames for debugging */
        // context.save();

        // context.fillStyle = 'rgba(255, 255, 255, .25)';
        // context.fillRect(this.left - xOffset, this.top,
        //                  this.right - this.left, this.bot - this.top);

        // context.fillStyle = 'rgba(255, 255, 0, .5)';
        // context.fillRect(this.rects[0].left - xOffset, this.rects[0].top,
        //                  this.rects[0].right - this.rects[0].left, this.rects[0].bot - this.rects[0].top);
        // for (let i = 1, len = this.rects.length; i < len; ++i) {
        //     context.fillStyle = 'rgba(255, 0, 0, .5)';
        //     context.fillRect(this.rects[i].left - xOffset, this.rects[i].top,
        //                      this.rects[i].right - this.rects[i].left, this.rects[i].bot - this.rects[i].top);
        // }
        // context.restore();
    }
    collCheck(rect, xOffset = 0) {
        if (this.hp > 0) {
            let result = false;
            if (rect instanceof ShotBeam) {
                result = Rect.checkPointsAgainst(this.mis, rect, xOffset);
            }
            else {
                result = rect.collCheck(this.mis, xOffset);
            }
            if (this.mis.fired && result) {
                this.mis.fired = false;
                ExpMgr.addExp(rect.x - xOffset + (this.mis.x - rect.x),
                    rect.y + (this.mis.y - rect.y));
            }
            if (rect.collCheck(this.rects[0], xOffset)) {
                return true;
            }
        }
        return false;
    }
    setHp(amt, data, type) {
        if (this.blinkTimer.started || this.defeated)
            return false;
        if (type instanceof Bomb)
            amt >>= 1;
        this.hp -= amt;
        if (this.hp <= 0) {
            this.defeated = true;
            this.blinkTimer.start();
            this.blinkTimer.repeat = true;
            this.blinkTimer.dur = .2;
            this.blinkTimer.callback = function () {
                ExpMgr.addExp(randInt(this.left + 50, this.right - 50) - data['gameXPos'], randInt(this.top + 100, this.bot));
            }.bind(this);
            data['player'].tempScore += SCORE_SHEET[this.constructor.name];
            data['player'].score = data['player'].tempScore;
            self.dispatchEvent(EVENT_BOSS_DONE);
        }

        this.blinkTimer.start();
        return true;
    }
    fireAnchor() {
        this.anchor.fire(this.x + 94, this.y - 10);
        this.anchor.ang = 0;
        switch (randInt(0, 2)) {
            case 0: this.anchor.force[0] = -400; this.anchor.force[1] = -400; this.anchor.accum = 3; break;
            case 1: this.anchor.force[0] = -600; this.anchor.force[1] = -400; this.anchor.accum = 2; break;
            case 2: this.anchor.force[0] = -400; this.anchor.force[1] = -400; this.anchor.accum = 2; break;
        }
    }
    fireMissile() {
        if (!this.mis.fired) {
            this.mis.fire(this.x + 94, this.y - 10);
            this.mis.timerWake.start();
            this.mis.ang = -135;
            this.mis.vel[0] = -150;
            this.mis.vel[1] = 150;
        }
    }
}
Boss.imgs = [
    getImg('./images/enemies/BargeA.png'),
    getImg('./images/enemies/BargeB.png'),
];
Boss.imgAnc = getImg('./images/enemies/Anchor.png'),
    Boss.imgMis = getImg('./images/enemies/Missile.png')