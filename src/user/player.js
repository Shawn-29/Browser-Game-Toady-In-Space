import { Bomb } from './bomb.js';
import { Rect } from '../rect.js';
import { ShotCollection } from '../shots/shot_collection.js';
import { TileMgr, checkTileBits, TILE_SIZE, TILE_TYPES, LEVEL_HEIGHT } from '../tile_mgr.js';
import { UserMgr } from './user_mgr.js';
import { Timer } from '../timer.js';

import { getImg } from '../utilities.js';

import {
    BASE_MOVE_VEL,
    CANVAS_BASE_HEIGHT,
    CANVAS_BASE_WIDTH,
    DASH_BOOST,
    HAZARD_DMG,
    MAX_SCORE_DIGITS,
    WALL_DMG
} from '../gameplay_constants.js';

export const ACTION_STOP = 1, ACTION_MU = ACTION_STOP << 1, ACTION_MD = ACTION_STOP << 2,
    ACTION_ML = ACTION_STOP << 3, ACTION_MR = ACTION_STOP << 4, ACTION_FIRE = ACTION_STOP << 5,
    ACTION_BL = ACTION_STOP << 6, ACTION_KO = ACTION_STOP << 7, ACTION_WIN = ACTION_STOP << 8,
    ACTION_BOMB = ACTION_STOP << 9, ACTION_PAUSE = ACTION_STOP << 10, ACTION_INV = ACTION_STOP << 11;

export const Player = class extends Rect {
    constructor(onKO, onLevelEnd) {
        super(78, 36, 80, 160);
        this.onKO = onKO;
        this.onLevelEnd = onLevelEnd;

        const data = UserMgr.getData();
        this.score = this.tempScore = data['score'];
        this.maxHP = 200;
        this.shots = null;

        /* no shot swap items will appear if a secret shot is unlocked */
        this.hasSecret = false;

        this.setShotType(UserMgr.getData(UserMgr.getActiveInd()).shotType);

        /* debug - uncomment the line below to give the player a certain shot type to test */
        // this.setShotType('ShotFreeze');

        this.bomb = new Bomb();

        this.reset();

        this.imgs = [
            getImg('./images/player/Toady.png'),
            getImg('./images/player/ToadyKO.png'),
            getImg('./images/player/Toady2.png'),
            getImg('./images/player/Toady3.png')
        ];
        this.hpBar = getImg('./images/ui/HPBar.png');

        this.blinkAccum = 1;
        this.blinkTimer = new Timer(1.0, this.blinkEnd.bind(this), false);
    }
    reset() {
        this.setPos(100, 160);
        this.animIndex = 0;
        this.blinkAccum = 1;
        this.xMove = 0;
        this.yMove = 0;
        this.vel = BASE_MOVE_VEL * 0.4;
        this.hp = this.maxHP;
        this.inputCodes = { 75: false, 74: false, 87: false, 83: false, 65: false, 68: false };
        this.scrollSpeed = 1.5;
        this.shots.reset();
        this.bomb.reset();
        this.action = 0x0;
        this.tempScore = this.score;
    }
    makeInvulnerable() {
        this.blinkAccum = 1;
        this.action |= ACTION_INV;
        this.blinkTimer.start(6);
    }
    update(dt, data = null) {
        if (this.action & ACTION_WIN) {
            return;
        }
        if (this.action & ACTION_INV) {
            this.blinkTimer.update(dt);
            this.animIndex = this.animIndex == 2 ? 3 : 2;
            if (this.blinkTimer.done) {
                this.action &= ~ACTION_INV;
                this.animIndex = 0;
            }
        }
        else if (this.action & ACTION_BL) {
            this.blinkAccum += 1;
            this.blinkTimer.update(dt, data);
        }
        else if (this.action & ACTION_KO) {
            this.blinkTimer.update(dt, data);
            if (this.blinkTimer.done) {
                this.move(0, ~~(BASE_MOVE_VEL * 1.5 * dt));
                if (this.top > CANVAS_BASE_HEIGHT * 2) {
                    this.action &= ~ACTION_KO;
                    this.onKO();
                }
            }
            else {
                this.move(0, ~~(-BASE_MOVE_VEL * 1.5 * dt));
            }

            return;
        }

        this.movePlayer(this.xMove, this.yMove, dt, data['gameXPos']);

        if (this.action & ACTION_FIRE) {
            this.shots.fire(this.right, this.bot);
        }
        this.shots.update(dt, data);

        if (this.action & ACTION_BOMB) {
            this.bomb.drop(this.x + data['gameXPos'], this.bot);
        }
        this.bomb.update(dt, data);
    }
    draw(context, xOffset = 0) {

        if (this.blinkAccum & 0x5) {
            context.drawImage(this.imgs[this.animIndex], this.x - this.imgs[this.animIndex].width * 0.5,
                this.y - this.imgs[this.animIndex].height * 0.5);
        }

        this.shots.draw(context, xOffset);

        this.bomb.draw(context, xOffset);

        context.drawImage(this.hpBar, 3, 5);
        context.fillStyle = '#f00';
        context.fillRect(21, 16, this.hp * (70 / this.maxHP), 9);
        context.drawImage(this.shots.imgIcon, 104, 5);
        context.drawImage(Bomb.imgs[0], 14, 40);

        context.save();
        context.fillStyle = '#fff';
        context.shadowColor = '#000';
        context.shadowOffsetX = -2;
        context.shadowOffsetY = 2;
        context.lineWidth = 2;
        context.textAlign = 'left';
        context.font = "24px sans serif";
        context.fillText('x' + this.bomb.qty, 54, 60);
        context.fillText('0'.repeat(MAX_SCORE_DIGITS - String(this.tempScore).length) + this.tempScore, 18, 86);
        context.restore();
    }
    inputDown(keyCode) {
        // console.log(`inputDown: ${keyCode}`);
        if (keyCode in this.inputCodes && !(this.action & (ACTION_KO | ACTION_WIN | ACTION_PAUSE))) {

            this.inputCodes[keyCode] = true;

            if (keyCode == 65) {
                this.action |= ACTION_ML;
                this.xMove = -this.vel;
            }
            if (keyCode == 68) {
                this.action |= ACTION_MR;
                this.xMove = this.vel;
            }
            if (keyCode == 87) {
                this.action |= ACTION_MU;
                this.yMove = -this.vel;
            }
            if (keyCode == 83) {
                this.action |= ACTION_MD;
                this.yMove = this.vel;
            }
            if (keyCode == 74) {
                this.action |= ACTION_FIRE
            }
            else if (keyCode == 75) {
                this.action |= ACTION_BOMB;
            }
        }
        else {
            if (keyCode == 49)
                this.scrollSpeed = 0;
            else if (keyCode == 50)
                this.scrollSpeed = 2;
            else if (keyCode == 51)
                this.scrollSpeed = 12;
        }
    }
    inputUp(keyCode) {
        // console.log(`inputUp: ${keyCode}`);
        if (keyCode in this.inputCodes && !(this.action & (ACTION_KO | ACTION_WIN | ACTION_PAUSE))) {

            if (keyCode == 65) {
                this.action &= ~ACTION_ML;
                if (this.action & ACTION_MR) {
                    this.xMove = this.vel;
                }
                else {
                    this.xMove = 0;
                }
            }
            if (keyCode == 68) {
                this.action &= ~ACTION_MR;
                if (this.action & ACTION_ML) {
                    this.xMove = -this.vel;
                }
                else {
                    this.xMove = 0;
                }
            }
            if (keyCode == 87) {
                this.action &= ~ACTION_MU;
                if (this.action & ACTION_MD) {
                    this.yMove = this.vel;
                }
                else {
                    this.yMove = 0;
                }
            }
            if (keyCode == 83) {
                this.action &= ~ACTION_MD;
                if (this.action & ACTION_MU) {
                    this.yMove = -this.vel;
                }
                else {
                    this.yMove = 0;
                }
            }
            if (keyCode == 74)
                this.action &= ~ACTION_FIRE;
            if (keyCode == 75)
                this.action &= ~ACTION_BOMB;

            this.inputCodes[keyCode] = false;
        }
    }
    movePlayer(xMove, yMove, dt, xOffset) {
        let xM = ~~(xMove * dt),
            yM = ~~(yMove * dt);

        let lTileOffset = this.left + xOffset + xM,
            lt = TileMgr.getPointTileType(lTileOffset, this.top),
            lb = TileMgr.getPointTileType(lTileOffset, this.bot);

        let result = checkTileBits(lt, lb);
        if (result & TILE_TYPES['TILE_WALL']) {
            xM = Math.trunc((this.left + xOffset) / TILE_SIZE) * TILE_SIZE - this.left - xOffset;
            this.setHp(WALL_DMG);
        }
        else if (result & TILE_TYPES['TILE_GOAL']) {
            this.win();
            return;
        }
        else if (result & TILE_TYPES['TILE_DASH_RIGHT']) {
            this.scrollSpeed = DASH_BOOST;
        }
        else {
            if (result & TILE_TYPES['TILE_HAZARD']) {
                this.setHp(HAZARD_DMG);
            }

            let rTileOffset = this.right + xOffset + xM,
                rt = TileMgr.getPointTileType(rTileOffset, this.top),
                rb = TileMgr.getPointTileType(rTileOffset, this.bot);

            result = checkTileBits(rt, rb);
            if (result & TILE_TYPES['TILE_WALL']) {
                xM = Math.trunc((rTileOffset) / TILE_SIZE) * TILE_SIZE - this.right - 1 - xOffset;

                /* check to see if the player is crushed against the side of the screen and a wall */
                if (this.left <= 0) {
                    this.KOPlayer();
                    return;
                }
                else {
                    this.setHp(WALL_DMG);
                }
            }
            else if (result & TILE_TYPES['TILE_GOAL']) {
                this.win();
                return;
            }
            else if (result & TILE_TYPES['TILE_DASH_RIGHT']) {
                this.scrollSpeed = DASH_BOOST;
            }
            else if (this.left + xM <= 0) {
                xM = -this.left;
            }
            else if (this.right + xM >= CANVAS_BASE_WIDTH) {
                xM = CANVAS_BASE_WIDTH - this.right;
            }
            else if (result & TILE_TYPES['TILE_HAZARD']) {
                this.setHp(HAZARD_DMG);
            }
        }

        if (this.top + yM <= 0) {
            yM = -this.top;
        }
        else if (this.bot + yM >= LEVEL_HEIGHT) {
            yM = LEVEL_HEIGHT - this.bot;
        }
        else {

            let lt = TileMgr.getPointTileType(this.left + xOffset + xM, this.top + yM),
                rt = TileMgr.getPointTileType(this.right + xOffset + xM, this.top + yM),
                xt = TileMgr.getPointTileType(this.x + xOffset + xM, this.top + yM);

            result = checkTileBits(lt, rt, xt);

            if (result & (TILE_TYPES['TILE_WALL'])) {
                yM = Math.trunc((this.top) / TILE_SIZE) * TILE_SIZE - this.top;
                this.setHp(WALL_DMG);
            }
            else {

                let lb = TileMgr.getPointTileType(this.left + xOffset + xM, this.bot + yM),
                    rb = TileMgr.getPointTileType(this.right + xOffset + xM, this.bot + yM),
                    xb = TileMgr.getPointTileType(this.x + xOffset + xM, this.bot + yM);

                result = checkTileBits(lb, rb, xb);
                if (result & TILE_TYPES['TILE_WALL']) {
                    yM = Math.trunc((this.bot) / TILE_SIZE + 1) * TILE_SIZE - this.bot - 1;
                    this.setHp(WALL_DMG);
                }
            }
        }

        this.move(xM, yM);
    }
    blinkEnd() {
        this.action &= ~ACTION_BL;
        this.blinkAccum = 1;
    }
    setHp(amt, ignoreBlink = false) {
        if (this.action & (ACTION_PAUSE | ACTION_INV))
            return;
        if (amt > 0 && (!(this.action & (ACTION_BL | ACTION_KO)) || ignoreBlink)) {
            this.hp = Math.max(this.hp - amt, 0);
            if (this.hp > 0) {
                if (!ignoreBlink) {
                    this.blinkAccum = 1;
                    this.blinkTimer.start();
                    this.action |= ACTION_BL;
                }
            }
            else {
                this.KOPlayer();
            }
        }
        else if (amt < 0) {
            this.hp = Math.min(this.hp - amt, this.maxHP);
        }
    }
    KOPlayer() {
        this.blinkTimer.start(.4);
        this.action = ACTION_KO;
        this.animIndex = 1;
        this.shots.reset();
    }
    win() {
        this.action = (ACTION_WIN | ACTION_PAUSE);
        this.score = this.tempScore;
        this.onLevelEnd();
    }
    pause() {
        this.action = ACTION_PAUSE;
        this.xMove = 0;
        this.yMove = 0;
        this.inputCodes = { 75: false, 74: false, 87: false, 83: false, 65: false, 68: false };
        this.blinkTimer.started = false;
    }
    addBomb(qty) {
        this.bomb.qty = Math.min(this.bomb.qty + qty, 5);
    }
    setShotType(shotType) {
        this.shotType = shotType;
        this.shots = new ShotCollection(shotType);
        switch (shotType) {
            case 'ShotDrill':
            case 'ShotBall':
            case 'ShotBeam':
                this.hasSecret = true;
        }
    }
    addVel(amt) {
        this.vel = ~~(Math.min(this.vel + amt, 500));
    }
};