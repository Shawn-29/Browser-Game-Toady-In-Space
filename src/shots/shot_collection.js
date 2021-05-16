import {ShotRegular} from './shot_regular.js';
import {ShotLazer} from './shot_lazer.js';
import {ShotFireWave} from './shot_fire_wave.js';
import {ShotCutter} from './shot_cutter.js';
import {ShotDrill} from './shot_drill.js';
import {ShotBall} from './shot_ball.js';
import {ShotBeam} from './shot_beam.js';
import {Timer} from '../timer.js';

export const ShotCollection = class {
    constructor(shotType) {
        this.timer = new Timer(0.0, null, false);
        this.shots = [];
        this.imgIcon = null;
        
        switch (shotType) {
            default:
            case 'ShotRegular':
                this.limit = ShotRegular.getShotLimit();
                this.timer.dur = ShotRegular.getDelay();
                for (let i = 0; i < this.limit; ++i) {
                    this.shots.push(new ShotRegular());
                }
                this.imgIcon = ShotRegular.imgIcon;
                break;
            case 'ShotLazer':
                this.limit = ShotLazer.getShotLimit();
                this.timer.dur = ShotLazer.getDelay();
                this.shots.push(new ShotLazer);
                this.imgIcon = ShotLazer.imgIcon;
                break;
            case 'ShotFireWave':
                this.limit = ShotFireWave.getShotLimit();
                this.timer.dur = ShotFireWave.getDelay();
                this.shots.push(new ShotFireWave());
                this.imgIcon = ShotFireWave.imgIcon;
                break;
            case 'ShotCutter':
                this.limit = ShotCutter.getShotLimit();
                this.timer.dur = ShotCutter.getDelay();
                this.shots.push(new ShotCutter());
                this.imgIcon = ShotCutter.imgIcon;
                break;
            case 'ShotDrill':
                this.limit = ShotDrill.getShotLimit();
                this.timer.dur = ShotDrill.getDelay();
                this.shots.push(new ShotDrill());
                this.imgIcon = ShotDrill.imgIcon;
                break;
            case 'ShotBall':
                this.limit = ShotBall.getShotLimit();
                this.timer.dur = ShotBall.getDelay();
                this.shots.push(new ShotBall());
                this.imgIcon = ShotBall.imgIcon;
                break;
            case 'ShotBeam':
                this.limit = 1;
                this.timer.dur = 2;
                this.shots.push(new ShotBeam());
                this.imgIcon = ShotBeam.imgIcon;
                break;
        }
    }
    update(dt, data = null) {
        this.timer.update(dt, data);
        
        for (let shot of this.shots) {
            shot.update(dt, data);
        }
    }
    draw(context, xOffset = 0) {
        for (const shot of this.shots) {
            shot.draw(context, xOffset);
        }        
    }
    reset() {
        for (let shot of this.shots) {
            shot.fired = false;
        }           
    }
    fire(x, y) {
        for (const shot of this.shots) {
            if (!shot.fired && (this.timer.done || !this.timer.started)) {
                shot.fire(x, y);
                this.timer.start();
                break;
            }
        }
    }
}; 