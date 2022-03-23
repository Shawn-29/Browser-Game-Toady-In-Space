import { ImgButton } from '../ui/img_button.js';
import { Modal } from '../ui/modal.js';
import { Timer } from '../timer.js';
import { UserMgr } from '../user/user_mgr.js';
import { drawThemeText } from '../utilities.js';

/* imports to display enemy images during the credits sequence */
import { Domesworth } from '../enemies/domesworth.js';
import { Clinger } from '../enemies/clinger.js';
import { Stretcher } from '../enemies/stretcher.js';
import { Philbert } from '../enemies/philbert.js';
import { VectorToad } from '../enemies/vector_toad.js';
import { Boss } from '../enemies/boss.js';

import { getImg } from '../utilities.js';

import {
    CANVAS_BASE_HEIGHT,
    CANVAS_BASE_WIDTH,
    EVENT_GAME_DONE
} from '../gameplay_constants.js';

export const CreditsScreen = class {
    constructor() {
        this.modal = new Modal(
            '',
            new ImgButton('./images/ui/ExitBtn.png', function () {
                self.dispatchEvent(EVENT_GAME_DONE);
            }.bind(this),
                166, 66,
                CANVAS_BASE_WIDTH >> 1, 320
            )
        );
        this.imgs = [
            ['Domesworth', Domesworth.img], ['Clinger', Clinger.img], ['Stretcher', Stretcher.imgs[0]],
            ['Philbert', Philbert.imgs[0]], ['Vector Toad', VectorToad.img],
            ['Space Barge', Boss.imgs[0]], ['Toady!', getImg('./images/player/Toady.png')]
        ];
        this.imgInd = -1;
        this.textX = CANVAS_BASE_WIDTH >> 1;
        this.name = '';
        this.epilogue = '';

        this.timer = new Timer(2, function () {
            this.timer.callback = function () {
                if (this.imgInd < this.imgs.length - 1) {
                    ++this.imgInd;
                    this.name = this.imgs[this.imgInd][0];
                }
                else {
                    this.name = '';
                    this.epilogue = 'Congratulations!'
                    this.timer.repeat = false;
                    this.modal.hidden = false;
                }
            }.bind(this);
            /* make the first image appear for the credits */
            this.timer.callback();
        }.bind(this), true).start();
    }
    update(dt, data = null) {
        this.timer.update(dt);
    }
    draw(context) {
        context.clearRect(0, 0, CANVAS_BASE_WIDTH, CANVAS_BASE_HEIGHT);
        context.fillStyle = "#000";
        context.fillRect(0, 0, CANVAS_BASE_WIDTH, CANVAS_BASE_HEIGHT);

        this.modal.draw(context);

        if (this.name.length > 0) {
            drawThemeText(context, 'Cast', this.textX, 40);
            drawThemeText(context, this.imgs[this.imgInd][0], this.textX, 330);
            context.drawImage(this.imgs[this.imgInd][1], this.textX - (this.imgs[this.imgInd][1].width >> 1),
                160 - (this.imgs[this.imgInd][1].height >> 1));
        }
        else if (this.epilogue.length > 0) {
            drawThemeText(context, this.epilogue, this.textX, 40, '44px');
            drawThemeText(context, 'With your help, Toady has found', this.textX, 110, '32px');
            drawThemeText(context, 'his way to a new vacation spot on', this.textX, 150, '32px');
            drawThemeText(context, 'a faraway world! Now Toady can', this.textX, 190, '32px');
            drawThemeText(context, 'finally relax! Or can he...?', this.textX, 230, '32px');
            drawThemeText(context, 'Your Score: ' + UserMgr.getData().score, this.textX, 274, '32px');
        }
    }
    mouseDown(e) {
        if (this.modal.hidden)
            return;
        let xOffset = (e.pageX - window.newGameX) * (CANVAS_BASE_WIDTH / window.newGameWidth);
        let yOffset = (e.pageY - window.newGameY) * (CANVAS_BASE_HEIGHT / window.newGameHeight);
        this.modal.checkPoint(xOffset, yOffset);
    }
};