import {ImgButton} from '../ui/img_button.js';
import {Modal} from '../ui/modal.js';
import {Timer} from '../timer.js';
import {UserMgr} from '../user/user_mgr.js';

/* imports to display enemy images during the credits sequence */
import {Domesworth} from '../enemies/domesworth.js';
import {Clinger} from '../enemies/clinger.js';
import {Stretcher} from '../enemies/stretcher.js';
import {Philbert} from '../enemies/philbert.js';
import {VectorToad} from '../enemies/vector_toad.js';
import {Boss} from '../enemies/boss.js';

import {getImg} from '../utilities.js';

import {
    CANVAS_BASE_HEIGHT,
    CANVAS_BASE_WIDTH,
    EVENT_GAME_DONE
} from '../gameplay_constants.js';

export const CreditsScreen = class {
    constructor() {
        this.modal = new Modal(
            '',
            new ImgButton('./images/ui/ExitBtn.png', function() {
                    UserMgr.get().clearData();
                    if (localStorage) {
                        localStorage.userData = UserMgr.get().getStringJSON();
                    }
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
        this.textX = gameCanvas.width >> 1;
        this.name = '';
        this.epilogue = '';
        
        this.timer = new Timer(2, function() {
            this.timer.callback = function() {
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
            this.timer.callback(); // make the first image appear
        }.bind(this), true).start();
    }
    update(dt, data = null) {
        this.timer.update(dt);
    }
    draw(context) {
        context.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        context.fillStyle = "#000";
        context.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        this.modal.draw(context);
        
        if (this.name.length > 0) {
            this.drawText(context, 'Cast', 40);
            this.drawText(context, this.imgs[this.imgInd][0], 330);
            context.drawImage(this.imgs[this.imgInd][1], this.textX - (this.imgs[this.imgInd][1].width >> 1),
                              160 - (this.imgs[this.imgInd][1].height >> 1));
        }
        else if (this.epilogue.length > 0) {
            this.drawText(context, this.epilogue, 40, '44px');
            this.drawText(context, 'With your help, Toady has found', 110, '32px');
            this.drawText(context, 'his way to a new vacation spot on', 150, '32px');
            this.drawText(context, 'a faraway world! Now Toady can', 190, '32px');
            this.drawText(context, 'finally relax! Or can he...?', 230, '32px');
            this.drawText(context, 'Your Score: ' + UserMgr.get().getData().score, 274, '32px');
        }
    }
    mouseDown(e) {
        if (this.modal.hidden)
            return;
        let xOffset = (e.pageX - window.newGameX) * (CANVAS_BASE_WIDTH / window.newGameWidth);
        let yOffset = (e.pageY - window.newGameY) * (CANVAS_BASE_HEIGHT / window.newGameHeight);
        this.modal.checkPoint(xOffset, yOffset);
    }
    drawText(context, msg, y, size = '40px', font = 'Cooper Black') {
        context.save();
        context.shadowColor = '#060';
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 4;
        context.lineWidth = 2;
        context.strokeStyle = '#060';
        context.fillStyle = '#ae0';
        context.textAlign = "center";
        context.font = `${size} ${font}`;
        context.strokeText(msg, this.textX, y);
        context.fillText(msg, this.textX, y + 4);
        context.restore();        
    }
};