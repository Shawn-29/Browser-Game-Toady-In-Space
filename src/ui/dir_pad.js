import { ImgButton } from './img_button.js';
import { Rect } from '../rect.js';

export const DirPad = class extends ImgButton {
    constructor(player, x, y) {

        let sizeLg = 100, sizeSm = 50, sizeMd = 40;

        super('./images/ui/DirPad_sm.png', null, sizeLg, sizeLg, x, y, null);
        this.upFn = function () {
            this.player.xMove = 0;
            this.player.yMove = 0;
            this.cX = this.x;
            this.cY = this.y;
        }.bind(this);

        this.player = player;

        this.imgX = this.left + sizeLg * 0.12;
        this.imgY = this.top + sizeLg * 0.16;

        this.cX = this.x;
        this.cY = this.y;
    }
    draw(context) {
        //context.drawImage(this.img, this.imgX, this.imgY);
        context.save();
        context.fillStyle = 'rgba(255, 0, 0, 0.6)';
        context.fillRect(this.left, this.top, this.right - this.left, this.bot - this.top);

        context.fillStyle = 'blue';
        context.beginPath();
        context.arc(this.cX, this.cY, 20, 0, 2 * Math.PI, false);
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = '#030';
        context.stroke();

        context.restore();
    }
    checkPoint(x, y) {

        if (Rect.checkPoint(x, y, this) || this.tapObj) {

            x = Math.min(this.right, Math.max(x, this.left));
            y = Math.min(this.bot, Math.max(y, this.top));

            let threshold = Math.hypot(x - this.x, y - this.y),
                angle = Math.atan2(y - this.y, x - this.x),
                roundVal = this.player.vel,
                xVel = 0,
                yVel = 0;

            if (threshold >= 70 || this.tapObj) {
                xVel = (Math.round(Math.cos(angle) * this.player.vel / roundVal)) * roundVal;
                yVel = (Math.round(Math.sin(angle) * this.player.vel / roundVal)) * roundVal;

                //xVel = Math.cos(angle) * this.player.vel;
                //yVel = Math.sin(angle) * this.player.vel;
                this.cX = x;
                this.cY = y;
                //console.log(xVel, yVel, this.player.vel);
            }
            else {
                xVel = 0;
                yVel = 0;
                this.cX = this.x;
                this.cY = this.y;
            }

            this.player.xMove = xVel;
            this.player.yMove = yVel;

            return true;
        }
        return false;
    }
};