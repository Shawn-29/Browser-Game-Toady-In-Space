import { BarcodeMgr } from '../barcode_scanner/video.js';
import { DataButton } from '../ui/data_button.js';
import { ImgButton } from '../ui/img_button.js';
import { Modal } from '../ui/modal.js';
import { UserMgr } from '../user/user_mgr.js';

import {
    getImg,
    getRandChoice,
    drawTextWrap,
    drawThemeText
} from '../utilities.js';

import { GameSaver } from '../game_saver.js';

import {
    CANVAS_BASE_HEIGHT,
    CANVAS_BASE_WIDTH,
    MAX_PATHS,
    RAND_LEVEL_CODE_ASTEROIDS,
    RAND_LEVEL_CODE_EURTH
} from '../gameplay_constants.js';

export const OptionsScreen = class {
    constructor(startGameFn) {
        this.startGameFn = startGameFn;
        this.reward = {};

        const saver = GameSaver;
        this.showSaveWarning = !saver.isEnabled;
        this.saveWarnBtn = new ImgButton(
            './images/ui/ResumeBtn.png',
            function () {
                this.showSaveWarning = false;
            }.bind(this),
            166, 66,
            CANVAS_BASE_WIDTH >> 1,
            CANVAS_BASE_HEIGHT - 66 - 70
        );

        if (saver.isEnabled) {
            /* create default user data if it doesn't exist */
            if (!saver.getValue('userData')) {
                saver.saveValue('userData', UserMgr.getStringJSON());
            }
            /* parse the local storage data if it exists and then store the parsed
                data to be used by the game*/
            else {
                const pathData = JSON.parse(saver.getValue('userData'));

                for (let i = 0; i < MAX_PATHS; ++i) {
                    UserMgr.setData(i, pathData[i]);
                }
            }
            /* set the intial high score if it doesn't exist */
            if (!saver.getValue('highScore')) {
                saver.saveValue('highScore', '000000');
            }

            UserMgr.setHighScore(saver.getValue('highScore'));
        }

        this.img = getImg('./images/ui/OptionsScreen.png');

        this.modal = new Modal(
            'Delete Game?',
            new ImgButton(
                './images/ui/NoBtn.png',
                function () { this.modal.hidden = true; }.bind(this),
                110, 66,
                CANVAS_BASE_WIDTH * 0.35, 170
            ),
            new ImgButton(
                './images/ui/YesBtn.png',
                function () {
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
                function () {
                    this.secretModal.hidden = true;

                    if (this.reward.randomLevelCode !== '') {
                        this.startGameFn();
                    }
                }.bind(this),
                280, 66,
                CANVAS_BASE_WIDTH >> 1, 170
            )
        );

        this.btns = [
            new DataButton(this.setActiveBtn.bind(this), UserMgr.getData(0), 556, 60, 323, 100),
            new DataButton(this.setActiveBtn.bind(this), UserMgr.getData(1), 556, 60, 323, 170),
            new DataButton(this.setActiveBtn.bind(this), UserMgr.getData(2), 556, 60, 323, 240),
            new ImgButton('./images/ui/StartBtn.png', function () {
                this.startGame();
            }.bind(this), 280, 66, 170, 320),
            new ImgButton('./images/ui/DeleteBtn.png', function () { this.modal.hidden = false }.bind(this), 280, 66, 472, 320),
            new ImgButton('./images/ui/BarcodeBtn.png', this.startScan.bind(this), 80, 40, 548, 31)
        ];

        this.setActiveBtn(this.btns[0]);

        this.hidden = false;
        this.cameraDoneFn = function () {

            self.removeEventListener('cameradone', this.cameraDoneFn, false);

            /* make the game canvas visible again */
            document.getElementById('game-canvas').style.display = 'block';

            /* option screen can receive input again */
            this.hidden = false;

            const barcode_result = BarcodeMgr.getBarcode();

            /* check if the barcode was read */
            if (barcode_result.length > 0) {

                const midIndex = barcode_result.length >>> 1;

                let levelAwarded = false;

                this.reward = { secretShot: '', randomLevelCode: '', msg: '' };

                /* award a randomly generated level based on the digit to the left
                    or right of the middle digit */
                if (barcode_result[midIndex - 1] < 3) {
                    this.reward.randomLevelCode = RAND_LEVEL_CODE_EURTH;
                    this.reward.msg = 'Warp Zone Activated!';
                    levelAwarded = true;
                }
                else if (barcode_result[midIndex + 1] > 6) {
                    this.reward.randomLevelCode = RAND_LEVEL_CODE_ASTEROIDS;
                    this.reward.msg = 'Warp Zone Activated!';
                    levelAwarded = true;
                }

                if (levelAwarded) {
                    /* get a random shot type to be used in the randomly-generated level */
                    this.reward.secretShot = getRandChoice(
                        'ShotRegular', 'ShotLazer', 'ShotFireWave', 'ShotCutter',
                        ['ShotDrill', 10], ['ShotBall', 10], ['ShotBeam', 10]
                    );
                }
                /* if no randomly-generated level was awarded, always award the
                    player with a secret shot */
                else {
                    /* get the middle digit of the barcode string and
                        grant a secret shot type based on it */
                    const middleDigit = barcode_result[midIndex];

                    if (middleDigit <= 3) {
                        this.reward.secretShot = 'ShotDrill';
                        this.reward.msg = 'Drill Obtained!';
                    }
                    else if (middleDigit <= 6) {
                        this.reward.secretShot = 'ShotBall';
                        this.reward.msg = 'Bouncy Ball Obtained!';
                    }
                    else {
                        this.reward.secretShot = 'ShotBeam';
                        this.reward.msg = 'Mega Beam Obtained!';
                    }

                    /* store the secret shot type so the user can begin a new game path with it */
                    UserMgr.getData().shotType = this.reward.secretShot;

                    this.activeBtn.setData(UserMgr.getData());

                    /* write the awarded shot type to the current path */
                    GameSaver.saveValue('userData', UserMgr.getStringJSON());
                }

                this.secretModal.msg = this.reward.msg;

                /* display the reward to the player */
                this.secretModal.hidden = false;

                /* reset the barcode; user must scan a barcode again to
                    be awarded with another secret reward */
                BarcodeMgr.resetBarcode();
            }
        }.bind(this);
    }
    startScan() {
        this.hidden = true;
        document.getElementById('game-canvas').style.display = 'none';
        BarcodeMgr.showCamera();
        self.addEventListener('cameradone', this.cameraDoneFn, false);
    }
    startGame() {
        this.startGameFn();
    }
    hideModal() {
        this.modal.hidden = false;
    }
    update(dt, data = null) {
        return;
    }
    draw(context) {

        if (this.showSaveWarning) {
            const textX = CANVAS_BASE_WIDTH >> 1;
            context.save();
            context.fillStyle = `#000`;
            context.fillRect(0, 0, CANVAS_BASE_WIDTH, CANVAS_BASE_HEIGHT);
            context.fillStyle = '#ef0';
            context.textAlign = 'center';
            context.font = '18px consolas';
            drawTextWrap(context,
                'Your browser is preventing this game from saving data. ' +
                'All progress will be lost when the browser closes. ' +
                'To fix this issue, try enabling cookies or updating your browser to the latest version.',
                textX, 100, CANVAS_BASE_WIDTH, 20
            );
            drawThemeText(context, 'WARNING!', textX, 40);
            context.restore();
            this.saveWarnBtn.draw(context);
            return;
        }

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
        context.fillText(UserMgr.getHighScore(), 76, 50, 140);
        context.restore();
    }
    mouseDown(e) {
        if (this.hidden)
            return;

        let xOffset = (e.pageX - window.newGameX) * (CANVAS_BASE_WIDTH / window.newGameWidth),
            yOffset = (e.pageY - window.newGameY) * (CANVAS_BASE_HEIGHT / window.newGameHeight);

        if (this.showSaveWarning) {
            this.saveWarnBtn.checkPoint(xOffset, yOffset);
            return;
        }

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
        if (this.activeBtn) {
            this.activeBtn.fillClr = '#264a2f';
        }
        this.activeBtn = btn;
        this.activeBtn.fillClr = '#262f8a';
        UserMgr.setActiveUser(this.btns.indexOf(this.activeBtn));
    }
    clearGame() {
        const activeInd = UserMgr.getActiveInd();

        UserMgr.clearData(activeInd);

        this.activeBtn.setData(UserMgr.getData(activeInd));

        GameSaver.saveValue('userData', UserMgr.getStringJSON());
    }
};