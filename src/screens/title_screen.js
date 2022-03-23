import { Timer } from '../timer.js';

import { getImg } from '../utilities.js';

import { CANVAS_BASE_HEIGHT, CANVAS_BASE_WIDTH } from '../gameplay_constants.js';

export const TitleScreen = class {
    constructor() {
        this.img = getImg('images/ui/TitleScreen.png');
        this.imgToady = getImg('images/player/Toady.png');
        this.toadyX = this.imgToady.width;
        this.flip = false;

        this.hideText = false;
        this.timer = new Timer(.5, () => this.hideText = !this.hideText, true);
        this.timer.start();
    }
    update(dt, data = null) {
        this.timer.update(dt);

        if (this.toadyX > CANVAS_BASE_WIDTH + this.imgToady.width * 1.25)
            this.flip = true;
        else if (this.toadyX < -this.imgToady.width << 1)
            this.flip = false;

        if (this.flip)
            this.toadyX -= 100 * dt;
        else
            this.toadyX += 100 * dt;
    }
    draw(context) {

        context.drawImage(this.img, 0, 0);

        if (this.flip) {
            context.save();
            context.scale(-1, 1);
            context.drawImage(this.imgToady, -this.toadyX, CANVAS_BASE_HEIGHT * 0.54,
                -this.imgToady.width * 1.25, this.imgToady.height * 1.25);
            context.restore();
        }
        else {
            context.drawImage(this.imgToady, this.toadyX, CANVAS_BASE_HEIGHT * 0.54,
                this.imgToady.width * 1.25, this.imgToady.height * 1.25);
        }

        if (this.hideText)
            return;

        context.save();

        context.shadowColor = '#090';
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 4;
        context.lineWidth = 3;
        context.strokeStyle = '#020';
        context.fillStyle = '#af0';
        context.textAlign = "center";
        context.font = "38px Showcard Gothic";
        context.strokeText(`Tap to Play`, CANVAS_BASE_WIDTH * 0.5, CANVAS_BASE_HEIGHT * 0.88);
        context.fillText(`Tap to Play`, CANVAS_BASE_WIDTH * 0.5, CANVAS_BASE_HEIGHT * 0.88);

        context.restore();
    }
};