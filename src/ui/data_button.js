import {Button} from './button.js';
import {ShotRegular} from '../shots/shot_regular.js';
import {ShotLazer} from '../shots/shot_lazer.js';
import {ShotFireWave} from '../shots/shot_fire_wave.js';
import {ShotCutter} from '../shots/shot_cutter.js';
import {ShotDrill} from '../shots/shot_drill.js';
import {ShotBall} from '../shots/shot_ball.js';
import {ShotBeam} from '../shots/shot_beam.js';

import {MAX_SCORE_DIGITS} from '../gameplay_constants.js';

export const DataButton = class extends Button {
    constructor(clickFn, data, width, height, x = 0, y = 0, upFn = null) {
        super(clickFn, width, height, x, y);
        
        this.fillClr = '#264a2f';
        
        this.setData(data);
    }
    setData(data) {
        this.data = {
            score: 'Score: ' +'0'.repeat(MAX_SCORE_DIGITS - String(data['score']).length) + data['score'],
            level: 'Level ' + data['level'],
        }
        
        switch (data['shotType']) {
            default:
            case 'Regular': this.img = ShotRegular.imgIcon; break;
            case 'Lazer': this.img = ShotLazer.imgIcon; break;
            case 'FireWave': this.img = ShotFireWave.imgIcon; break;
            case 'Cutter': this.img = ShotCutter.imgIcon; break;
            case 'Drill': this.img = ShotDrill.imgIcon; break;
            case 'Ball': this.img = ShotBall.imgIcon; break;
            case 'Beam': this.img = ShotBeam.imgIcon; break;
        }       
    }
    draw(context) {
        context.fillStyle = this.fillClr;
        context.fillRect(this.left, this.top, this.right - this.left, this.bot - this.top);
        
        context.drawImage(this.img, this.right * 0.12, this.y - this.img.height * 0.5);
        
        context.font = '32px cooper black';
        context.fillStyle = '#25bc37';
        context.fillText(this.data.score, this.right * 0.27, this.top + 40);
        context.fillText(this.data.level, this.right * 0.76, this.top + 40);
    }
};