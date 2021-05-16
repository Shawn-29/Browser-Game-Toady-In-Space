import {ImgButton} from './img_button.js';

import {CANVAS_BASE_HEIGHT, CANVAS_BASE_WIDTH} from '../gameplay_constants.js';

export const Modal = class {
    constructor(msg, ...btns) {
        this.msg = msg;
        this.btns = btns.filter(val => val instanceof ImgButton);
        this.hidden = true;
    }
    draw(context) {
        if (this.hidden)
            return;
        context.save();
        context.fillStyle = 'rgba(0, 0, 0, 0.55)';
        context.fillRect(0, 0, CANVAS_BASE_WIDTH, CANVAS_BASE_HEIGHT);
        context.font = '40px cooper black';
        context.fillStyle = '#25dc37';
        context.textAlign = 'center';
        context.shadowColor = '#000';
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 4;
        context.shadowBlur = 12;
        context.fillText(this.msg, CANVAS_BASE_WIDTH >> 1, 96);
        context.lineWidth = 2;
        context.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        context.strokeText(this.msg, CANVAS_BASE_WIDTH >> 1, 96);
        context.restore();
        for (let b of this.btns)
            b.draw(context);
    }
    checkPoint(xOffset, yOffset) {
        for (let btn of this.btns) {
            if (btn.checkPoint(xOffset, yOffset)) {
                break;
            }
        }
    }
};