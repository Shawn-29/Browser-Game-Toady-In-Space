import {DataButton} from '../ui/data_button.js';
import {ImgButton} from '../ui/img_button.js';
import {Modal} from '../ui/modal.js';
import {UserMgr} from '../user/user_mgr.js';

import {getImg} from '../utilities.js';

import {CANVAS_BASE_HEIGHT, CANVAS_BASE_WIDTH, MAX_PATHS} from '../gameplay_constants.js';

import {barcode_result} from '../barcode_scanner/video.js';

export const OptionsScreen = class {
    constructor(startGameFn) {
        this.startGameFn = startGameFn;
        if (localStorage) {
            /* create default localStorage data if it doesn't exist */
            if (!localStorage.userData) {
                localStorage.userData = UserMgr.get().getStringJSON();
            }
            /* parse the local storage data if it exists and then store the parsed
                data to be used by the game*/
            else {
                let pathData = JSON.parse(localStorage.userData);

                for (let i = 0; i < MAX_PATHS; ++i) {
                    UserMgr.get().setData(i, pathData[i]);
                }
            }
            if (!localStorage.highScore)
                localStorage.highScore = '000000';
            UserMgr.get().setHighScore(localStorage.highScore);
        }
        
        this.img = getImg('./images/ui/OptionsScreen.png');
        
        this.modal = new Modal(
            'Delete Game?',
            new ImgButton(
                './images/ui/NoBtn.png',
                function() { this.modal.hidden = true; }.bind(this),
                110, 66,
                CANVAS_BASE_WIDTH * 0.35, 170
            ),
            new ImgButton(
                './images/ui/YesBtn.png',
                function() {
                    this.modal.hidden = true;
                    this.clearGame();
                }.bind(this),
                110, 66,
                CANVAS_BASE_WIDTH * 0.65, 170
            )
        );
        this.secretModal = new Modal(
            '',
            new ImgButton(
                './images/ui/AwesomeBtn.png',
                function() { this.secretModal.hidden = true; }.bind(this),
                280, 66,
                CANVAS_BASE_WIDTH >> 1, 170
            )
        );
        
        this.btns = [
            new DataButton(this.setActiveBtn.bind(this), UserMgr.get().getData(0), 556, 60, 323, 100),
            new DataButton(this.setActiveBtn.bind(this), UserMgr.get().getData(1), 556, 60, 323, 170),
            new DataButton(this.setActiveBtn.bind(this), UserMgr.get().getData(2), 556, 60, 323, 240),
            new ImgButton('./images/ui/StartBtn.png', function() {
                this.startGame();
            }.bind(this), 280, 66, 170, 320),
            new ImgButton('./images/ui/DeleteBtn.png', function() { this.modal.hidden = false }.bind(this), 280, 66, 472, 320),
            new ImgButton('./images/ui/BarcodeBtn.png', this.startScan.bind(this), 80, 40, 548, 31)
        ];

        this.setActiveBtn(this.btns[0]);
        
        this.hidden = false;
        this.cameraDoneFn = function() {
            // option screen can receive input again
            this.hidden = false;
            // check if the barcode was read
            if (barcode_result.length) {
                // find the middle digit of the barcode string and
                // grant secret shot type based on it
                if (parseInt(barcode_result[barcode_result.length >> 1]) < 5) {
                    UserMgr.get().getData().shotType = 'Drill';
                    this.secretModal.msg = 'Drill Obtained!';
                }
                else {
                    UserMgr.get().getData().shotType = 'Ball';
                    this.secretModal.msg = 'Bouncy Ball obtained!';
                }
                
                this.secretModal.hidden = false;
                
                this.activeBtn.setData(UserMgr.get().getData());

                // write the awarded shot type to the current path
                localStorage.userData = UserMgr.get().getStringJSON();
                
                // reset the barcode; user must scan a barcode again to
                // be awarded with another secret shot type
                barcode_result = '';
            }          
        }.bind(this);
        self.addEventListener('cameradone', this.cameraDoneFn, false);
    }
    startScan() {
        this.hidden = true;
        document.getElementById('game-canvas').style.display = 'none';
        document.getElementById('camera-area').style.display = 'block';
    }
    startGame() {
        self.removeEventListener('cameradone', this.cameraDoneFn, false);
        this.startGameFn();
    }
    hideModal() {
        this.modal.hidden = false;
    }
    update(dt, data = null) {
        return;
    }
    draw(context) {
        context.drawImage(this.img, 0, 0);
        
        for (let btn of this.btns) {
            btn.draw(context)
        }
        
        this.modal.draw(context);
        this.secretModal.draw(context);
        
        context.save();
        context.fillStyle = '#ef0';
        context.font = '28px consolas';
        context.textAlign = 'center';
        context.fillText('HIGH', 76, 24, 140);
        context.fillText(UserMgr.get().getHighScore(), 76, 50, 140);
        context.restore();
    }
    mouseDown(e) {
        if (this.hidden)
            return;
        
        let xOffset = (e.pageX - window.newGameX) * (CANVAS_BASE_WIDTH / window.newGameWidth);
        let yOffset = (e.pageY - window.newGameY) * (CANVAS_BASE_HEIGHT / window.newGameHeight);

        if (this.secretModal.hidden) {
            if (this.modal.hidden) {
                for (let btn of this.btns) {
                    if (btn.checkPoint(xOffset, yOffset)) {
                        break;
                    }
                }
            }
            else {
                this.modal.checkPoint(xOffset, yOffset);
            }           
        }
        else {
            this.secretModal.checkPoint(xOffset, yOffset);           
        }
    }
    setActiveBtn(btn) {
        if (this.activeBtn)
            this.activeBtn.fillClr = '#264a2f';
        this.activeBtn = btn;
        this.activeBtn.fillClr = '#262f8a';
        UserMgr.get().setActiveUser(this.btns.indexOf(this.activeBtn));
    }
    clearGame() {
        let activeInd = UserMgr.get().getActiveInd();
        
        UserMgr.get().clearData(activeInd);
        
        this.activeBtn.setData(UserMgr.get().getData(activeInd));
        
        localStorage.userData = UserMgr.get().getStringJSON();
    }
};