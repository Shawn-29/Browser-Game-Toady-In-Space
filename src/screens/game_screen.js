import {getImg, randBool, randInt} from '../utilities.js';
import {randAsteroid, randEnemy} from '../enemies/rand_enemy.js';
import {randItem} from '../items/random_item.js';

import {ExpMgr} from '../explosion_mgr.js';
import {Player, ACTION_KO, ACTION_WIN} from '../user/player.js';
import {Rect} from '../rect.js';
import {Screen} from './screen.js';
import {TileMgr, TILE_SIZE} from '../tile_mgr.js';
import {Timer} from '../timer.js';
import {UserMgr} from '../user/user_mgr.js';

/* import constants */
import {
    CANVAS_BASE_HEIGHT,
    CANVAS_BASE_WIDTH,
    EVENT_CREDITS_START,
    EVENT_GAME_DONE,
    MAX_LEVEL,
    LEVEL_HEIGHT,
    RAND_LEVEL_CODE_EURTH,
    RAND_LEVEL_CODE_ASTEROIDS
} from '../gameplay_constants.js';

/* import UI */
import {DirPad} from '../ui/dir_pad.js';
import {Modal} from '../ui/modal.js';
import {ImgButton} from '../ui/img_button.js';

/* import enemies */
import {Domesworth} from '../enemies/domesworth.js';
import {Clinger} from '../enemies/clinger.js';
import {Stretcher} from '../enemies/stretcher.js';
import {Philbert} from '../enemies/philbert.js';
import {Asteroid} from '../enemies/asteroid.js';
import {VectorToad} from '../enemies/vector_toad.js';
import {DomesworthV2} from '../enemies/domesworth_v2.js';
import {SmileyBall} from '../enemies/smiley_ball.js';
import {Boss} from '../enemies/boss.js';
import {Barrier} from '../enemies/barrier.js';
import {EnergyField} from '../enemies/energy_field.js';
import {Fan} from '../enemies/fan.js';
import {Lava} from '../enemies/lava.js';

/* import items */
import {CoinG} from '../items/coin_green.js';
import {CoinR} from '../items/coin_red.js';
import {CoinY} from '../items/coin_yellow.js';
import {CoinP} from '../items/coin_purple.js';
import {CoinS} from '../items/coin_special.js';
import {ShotSwap} from '../items/shot_swap.js';
import {BombRefill} from '../items/bomb_refill.js';
import {SpeedBoost} from '../items/speed_boost.js';

const OBJECT_FACTORY = Object.freeze({
    'Domesworth': (x, y) => new Domesworth(x, y),
    'Clinger': (x, y) => new Clinger(x, y),
    'Stretcher': (x, y) => new Stretcher(x, y),
    'Philbert': (x, y) => new Philbert(x, y),
    'Asteroid': (x, y, size, xVel = 0, yVel = 0) => new Asteroid(x, y, size, xVel, yVel),
    'VectorToad': (x, y) => new VectorToad(x, y),
    'DomesworthV2': (x, y) => new DomesworthV2(x, y),
    'SmileyBall': (x, y) => new SmileyBall(x, y),
    'Boss': (x, y) => new Boss(x, y),
    'Barrier': (x, y) => new Barrier(x),
    'EnergyField': (x, y, h, v) => new EnergyField(x, y, h, v),
    'Fan': (x, y) => new Fan(x, y),
    'CoinG': (x, y) => new CoinG(x, y),
    'CoinR': (x, y) => new CoinR(x, y),
    'CoinY': (x, y) => new CoinY(x, y),
    'CoinP': (x, y) => new CoinP(x, y),
    'CoinS': (x, y) => new CoinS(x, y),
    'ShotSwap': (x, y) => new ShotSwap(x, y),
    'BombRefill': (x, y) => new BombRefill(x, y),
    'SpeedBoost': (x, y) => new SpeedBoost(x, y),
    'Lava': (x, dir) => new Lava(x, dir) 
});

const startItemTimers = () => {
    CoinG.timer.start();
    ShotSwap.timer.start();

    Lava.animTimer.start();
};

const updateItemTimers = (dt) => {
    CoinG.timer.update(dt);
    ShotSwap.timer.update(dt);

    Lava.animTimer.update(dt);
};

export const GameScreen = class {
    constructor(gameCanvas, secretData) {

        this.gameData = {
            'player': new Player(this.resetLevel.bind(this),
                                this.endLevel.bind(this)),
            'gameRect': new Rect(CANVAS_BASE_WIDTH, CANVAS_BASE_HEIGHT, CANVAS_BASE_WIDTH * 0.5, 0),
            'enemyList': new Set(),
            'itemList': new Set(),
            'screens': [],
            'enemyFileData': [],
            'itemFileData': [],
            'levelName': '',
            'gameXPos': 0,
            'loaded': false,
            secretData
        };
        
        this.modal = new Modal(
            'Game Paused',
            new ImgButton(
                './images/ui/ResumeBtn.png',
                function() {
                    this.modal.hidden = true;
                }.bind(this),
                166, 66, CANVAS_BASE_WIDTH * 0.31, 170
            ),
            new ImgButton(
                './images/ui/ExitBtn.png',
                function() {
                    this.gameData['loaded'] = false;
                    this.exitGameScreen();
                    self.dispatchEvent(EVENT_GAME_DONE);
                }.bind(this),
                166, 66, CANVAS_BASE_WIDTH * 0.7, 170
            )
        );
        
        this.btns = [
            new ImgButton(
                './images/ui/PauseBtn.png',
                function() {
                    if (this['gameData'].player.action & ACTION_KO)
                        return;
                    this.modal.hidden = false;
                }.bind(this),
                160, 56, 280, 339
            ),
            new ImgButton(
                './images/ui/FireBtn.png',
                function() {
                    this.gameData['player'].inputDown(74);
                }.bind(this),
                90, 90, 466, 314,
                function() {
                    this.gameData['player'].inputUp(74);
                }.bind(this)
            ),
            new ImgButton(
                './images/ui/BombBtn.png',
                function() {
                    this.gameData['player'].inputDown(75);
                }.bind(this),
                90, 90, 574, 314,
                function() {
                    this.gameData['player'].inputUp(75);                
                }.bind(this)
            ),
            new DirPad(
                this.gameData['player'],
                70, 280
            )
        ];
        
        this.statusBar = getImg('./images/ui/StatusBar.png');
        
        this.sceneTimer = new Timer(1.01, function() {
            this.draw = this.drawGame;
            this.levelDone = false;
        }.bind(this), false);

        this.gradStops = {
            stop1: 0.0,
            stop2: 0.2,
            stop3: 0.4
        }
        
        this.draw = this.drawSplash;
        this.levelDone = false;
        this.scoreBonus = 0;

        this.gameCanvas = gameCanvas;
        
        self.addEventListener('keydown', this.keyDown.bind(this));
        self.addEventListener('keyup', this.keyUp.bind(this));
        
        /*
            because bind creates a new function object, these functions
            must be stored so that they can be removed later if the user
            exits the game screen
        */
        this.touchStartFn = this.touchStart.bind(this);
        this.touchEndFn = this.touchEnd.bind(this);
        this.touchMoveFn = this.touchMove.bind(this);
        this.gameCanvas.addEventListener('touchstart', this.touchStartFn, false);
        this.gameCanvas.addEventListener('touchend', this.touchEndFn, false);
        this.gameCanvas.addEventListener('touchmove', this.touchMoveFn, false);
        
        this.gameOver = false;
        this.fadeStep = 0;
        let gameScreen = this;
        this.bossDoneFn = function(e) {
            gameScreen.gameData['player'].pause();
            gameScreen.gameOver = true;
            gameScreen.sceneTimer.dur = .25;
            gameScreen.sceneTimer.repeat = true;
            gameScreen.sceneTimer.callback = function() {
                gameScreen.fadeStep += .03;
                if (gameScreen.fadeStep > 1) {
                    gameScreen.sceneTimer.reset();
                    this.exitGameScreen();
                    gameScreen.awardPoints();
                    self.dispatchEvent(EVENT_CREDITS_START);
                }
            }.bind(gameScreen);
            gameScreen.sceneTimer.start();
        };
        self.addEventListener('bossdone', this.bossDoneFn, false);
        
        startItemTimers();
    }
    update(dt, data = null) {
        if (!this.gameData['loaded'] || !this.modal.hidden)
            return;
        
        if (this.gameOver) {
            this.sceneTimer.update(dt);
        }
        else if (!this.sceneTimer.done) {
            this.sceneTimer.update(dt);
            return;
        }
        
        ExpMgr.get().update(dt, this.gameData['gameXPos']);

        TileMgr.get().update(this.gameData);
        
        if (!(this.gameData['player'].action & (ACTION_KO | ACTION_WIN))) {
        
            if (!TileMgr.get().isDone()) {
                /* update the game's x position */
                this.gameData['gameXPos'] = TileMgr.get().getXPos(
                    this.gameData['gameXPos'],
                    this.gameData['player'].scrollSpeed
                );
            }

            /* activate objects within traversed game screens */
            let offset = Math.min(
                Math.trunc(
                    (this.gameData['gameRect'].right + this.gameData['gameXPos']) /
                        (CANVAS_BASE_WIDTH * 0.25)
                ),
                this.gameData['screens'].length - 1
            );
            this.gameData['screens'][offset].activate(this.gameData['enemyList'],
                                                     this.gameData['itemList']);

            for (let e of this.gameData['enemyList']) {
                e.update(dt, this.gameData);
                if (e.done) {
                    this.gameData['enemyList'].delete(e);
                }
            }
            
            for (let i of this.gameData['itemList']) {
                i.update(dt, this.gameData);
                if (i.done) {
                    this.gameData['itemList'].delete(i);
                }
            }
            
            updateItemTimers(dt);
        }
        
        this.gameData['player'].update(dt, this.gameData);
    }
    drawSplash(context) {     
        context.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        context.fillStyle = "#000";
        context.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        const grad = context.createLinearGradient(0, 0, this.gameCanvas.width, 0);
        grad.addColorStop("0", "#0b0");

        this.gradStops.stop1 = Math.min(1.0, this.gradStops.stop1 + 0.01);
        this.gradStops.stop2 = Math.min(1.0, this.gradStops.stop2 + 0.01);
        this.gradStops.stop3 = Math.min(1.0, this.gradStops.stop3 + 0.01);
        if (this.gradStops.stop1 >= 1.0) {
            this.gradStops.stop1 = 0.0;
            this.gradStops.stop2 = 0.2;
            this.gradStops.stop3 = 0.4;
        }

        grad.addColorStop(this.gradStops.stop1, "#0b0");
        grad.addColorStop(this.gradStops.stop2, "#f00");
        grad.addColorStop(this.gradStops.stop3, "#0b0");

        context.save();
        context.textAlign = "center";
        context.fillStyle = grad;
        context.font = "58px Cooper Black";
        context.fillText(`${this.gameData['levelName']}`, this.gameCanvas.width >> 1, 160);
        context.shadowColor = '#fb0';
        context.shadowOffsetX = -1;
        context.shadowOffsetY = 4;
        context.font = '36px Showcard Gothic';
        context.fillStyle = '#25bc37';
        context.fillText('Get Ready!!', this.gameCanvas.width >> 1, 260);
        context.restore();
    }
    drawTally(context) {
        context.fillStyle = 'rgba(0, 0, 0, 0.55)';
        context.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        context.font = '40px Showcard Gothic';

        context.save();
        context.textAlign = "center";
        context.shadowColor = '#fb0';
        context.shadowOffsetX = -1;
        context.shadowOffsetY = 4;
        context.fillStyle = '#25bc37';
        context.fillText(this.gameData['levelName'], this.gameCanvas.width >> 1, 100);
        context.fillText('completed!!', this.gameCanvas.width >> 1, 180);
        context.shadowColor = '#f40';
        context.fillStyle = '#eee';
        context.fillText(`HP Bonus: ${this.scoreBonus} pts.`, this.gameCanvas.width >> 1, 260);
        context.restore();
    }
    drawGame(context) {
        context.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        context.fillStyle = "#d0d";
        context.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        
        if (this.gameData['loaded']) {
            
            TileMgr.get().draw(context, this.gameData['gameXPos']);

            for (let i of this.gameData['itemList']) {
                i.draw(context, this.gameData['gameXPos']);
            }
            
            for (let e of this.gameData['enemyList']) {
                e.draw(context, this.gameData['gameXPos']);
            }

            ExpMgr.get().draw(context, this.gameData['gameXPos']);

            this.gameData['player'].draw(context, this.gameData['gameXPos']);
            
            context.drawImage(this.statusBar, 0, CANVAS_BASE_HEIGHT - 40);
            
            context.save();
            context.globalAlpha = 0.8;
            for (let b of this.btns) {
                b.draw(context);
            }
            context.restore();
            
            if (this.levelDone) {
                this.drawTally(context);
            }

            this.modal.draw(context);
        }
        
        if (this.gameOver) {
            context.fillStyle = `rgba(0, 0, 0, ${this.fadeStep})`;
            context.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        }
        
        /* display coodinate and object data for debugging */
        context.save();
        context.fillStyle = '#fff';
        context.font = '14px sans-serif';
        context.fillText('Y: ' + String(this.gameData['player'].y), 4, 110);
        context.fillText('Game X: ' + String(this.gameData['gameXPos']), 4, 130);
        context.fillText('Player X: ' + String(this.gameData['gameXPos'] + this.gameData['player'].x), 4, 150);
        context.fillText('Enemy Count: ' + String(this.gameData['enemyList'].size), 4, 170);
        context.fillText('Item Count: ' + String(this.gameData['itemList'].size), 4, 190);
        context.restore();       
    }
    mouseDown(e) {
        let xOffset = (e.pageX - window.newGameX) * (CANVAS_BASE_WIDTH / window.newGameWidth),
            yOffset = (e.pageY - window.newGameY) * (CANVAS_BASE_HEIGHT / window.newGameHeight);
        
        if (this.modal.hidden) {
            for (let btn of this.btns) {
                btn.checkPoint(xOffset, yOffset);
            }            
        }
        else {
            this.modal.checkPoint(xOffset, yOffset);
        }
        
    }
    touchStart(e) {
        e.preventDefault();
        if (this.gameOver)
            return;
        for (let t of e.changedTouches) {
            let xOffset = (t.pageX - window.newGameX) * (CANVAS_BASE_WIDTH / window.newGameWidth);
            let yOffset = (t.pageY - window.newGameY) * (CANVAS_BASE_HEIGHT / window.newGameHeight);
        
            if (this.modal.hidden) {
                for (let btn of this.btns) {
                    if (btn.checkPoint(xOffset, yOffset)) {
                        btn.setTapObj(t);
                        break;
                    }
                }
            }
            else {
                this.modal.checkPoint(xOffset, yOffset);
            }
        }
    }
    touchEnd(e) {
        e.preventDefault();
        if (this.gameOver)
            return;
        let touch = e.changedTouches[0];
        
        for (let btn of this.btns) {
            if (btn.tapObj && btn.tapObj.identifier == touch.identifier) {
                
                if (btn.upFn) {
                    btn.upFn();
                }
                
                btn.tapObj = null;
                break;
            }
        }
    }
    touchMove(e) {
        e.preventDefault();
        if (this.gameOver)
            return;
        let touch = e.changedTouches[0];
        let xOffset = (touch.pageX - window.newGameX) * (CANVAS_BASE_WIDTH / window.newGameWidth);
        let yOffset = (touch.pageY - window.newGameY) * (CANVAS_BASE_HEIGHT / window.newGameHeight);
        
        for (let btn of this.btns) {
            if (btn.tapObj && btn.tapObj.identifier == touch.identifier) {
                if (!btn.checkPoint(xOffset, yOffset)) {
                    if (btn.upFn)
                        btn.upFn();
                    btn.tapObj = null;
                }
                break;
            }
        }
    }
    keyDown(e) {
        this.gameData['player'].inputDown(e.keyCode);
    }
    keyUp(e) {
        this.gameData['player'].inputUp(e.keyCode);
    }
    loadLevel() {

        if (this.gameData['secretData'].randomLevelCode > 0) {

            this.gameData['player'].setShotType(this.gameData['secretData'].secretShot);

            switch (this.gameData['secretData'].randomLevelCode) {
                case RAND_LEVEL_CODE_EURTH:
                    this.loadRandomLevelEurth();
                    this.gameData['isSecretLevel'] = true;
                    return;
                case RAND_LEVEL_CODE_ASTEROIDS:
                    this.loadRandomLevelAsteroids();
                    this.gameData['isSecretLevel'] = true;
                    return;
            }
        }

        const gameScreen = this;
        
        // let levelStr = "./level_data/F2.json";
        // let levelStr = "./level_data/Level7.json";
        const levelStr = "./level_data/Level" + UserMgr.get().getData().level + ".json";

        let jsonData = null;
        
        fetch(levelStr)
        .then((response) => {
            if (!response.ok) {
                throw Error(response);
            }
            return response.json();
        })
        .then((data) => {
                jsonData = data;
                   
                TileMgr.get().reset();
                TileMgr.get().setTiles(jsonData['tiles']);

                if (TileMgr.get().tilesLoaded()) {

                    let levelWidth = TILE_SIZE * jsonData['tiles'][0].length,
                        numScreens = Math.ceil(levelWidth / (CANVAS_BASE_WIDTH * 0.25));

                    for (let i = 0; i < numScreens; ++i) {
                        gameScreen.gameData['screens'].push(
                            new Screen(
                                CANVAS_BASE_WIDTH * 0.25,
                                CANVAS_BASE_HEIGHT,
                                CANVAS_BASE_WIDTH * .125 + CANVAS_BASE_WIDTH * 0.25 * i,
                                0
                            )
                        );
                    }
                    
                    gameScreen.gameData['enemyFileData'] = jsonData['enemies'];
                    gameScreen.gameData['itemFileData'] = jsonData['items'];
                    gameScreen.gameData['levelName'] = jsonData['name'];
                    gameScreen.draw = gameScreen.drawSplash;
                    
                    return './tile_data/' + jsonData['tileDataFile'];
                }
        }).then((response) => {
           fetch(response)
           .then((response) => { return response.json(); })
           .then((data) => {
               jsonData = data;
               TileMgr.get().setTileTypes(jsonData['tileTypes']);
           })
           .then(() => {
               gameScreen.placeEnemies();
               gameScreen.gameData['loaded'] = true;
               gameScreen.sceneTimer.start();
           });
        })
        .catch((error) => {
            console.log('Error:', error);
        });
    }
    async loadSafetyZone() {
        return await fetch(`./level_data/FSafety.json`)
        .then(function(response) {
            return response.json();
        });        
    }
    async loadEndZone() {
        return await fetch('./level_data/FEnd.json')
        .then(function(response) {
            return response.json();
        });
    }
    async loadFormation() {
        return await fetch(`./level_data/F${randInt(1, 10)}.json`)
        .then(function(response) {
            return response.json();
        });
    }
    loadRandomLevelEurth() {
        let gameScreen = this,
            enemyObj = null,
            itemObj = null,
            xOffset = -1;

        Promise.all(
            [
                gameScreen.loadSafetyZone(),
                ...Array.from({length: randInt(8, 10)}, () => this.loadFormation()),
                gameScreen.loadEndZone()
            ]
        )
        .then((values) => {

            const tiles = Array.from({length: 8}, () => []),
                safetyZoneWidth = TILE_SIZE * values[0]['tiles'][0].length;

            for (let i = 0, len = values.length; i < len; ++i) {
                for (let z = 0, y = values[i]['tiles'].length; z < y; ++z) {
                    tiles[z].push(...values[i]['tiles'][z]);
                }
                xOffset = safetyZoneWidth + CANVAS_BASE_WIDTH * Math.max(i - 1, 0);
                if (values[i]['enemyPoints']) {
                    for (let e of values[i]['enemyPoints']) {
                        enemyObj = randEnemy(e.x[0] + xOffset, e.x[1] + xOffset, e.y[0], e.y[1]);
                        if (Array.isArray(enemyObj)) {
                            for (let e of enemyObj) {
                                gameScreen.gameData['enemyFileData'].push(e);
                            }
                        }
                        else {
                            gameScreen.gameData['enemyFileData'].push(enemyObj);
                        }
                    }
                }
                if (values[i]['itemPoints']) {
                    for (let e of values[i]['itemPoints']) {
                        itemObj = randItem(e.x[0] + xOffset, e.x[1] + xOffset, e.y[0], e.y[1]);
                        if (!itemObj)
                            continue;
                        if (Array.isArray(itemObj)) {
                            for (let e of itemObj) {
                                gameScreen.gameData['itemFileData'].push(e);
                            }
                        }
                        else {
                            gameScreen.gameData['itemFileData'].push(itemObj);
                        }
                    }
                }
            }
            
            TileMgr.get().setTiles(tiles);
            
            if (TileMgr.get().tilesLoaded()) {

                let levelWidth = TILE_SIZE * tiles[0].length,
                    numScreens = Math.ceil(levelWidth / (CANVAS_BASE_WIDTH * 0.25));

                for (let i = 0; i < numScreens; ++i) {
                    gameScreen.gameData['screens'].push(
                        new Screen(
                            CANVAS_BASE_WIDTH * 0.25,
                            CANVAS_BASE_HEIGHT,
                            CANVAS_BASE_WIDTH * .125 + CANVAS_BASE_WIDTH * 0.25 * i,
                            0
                        )
                    );
               }
                
                gameScreen.gameData['levelName'] = '???????';
                gameScreen.draw = gameScreen.drawSplash;

                return './tile_data/' + 'eurth_tiles.json';
            }
        })
        .then((response) => {
            fetch(response)
            .then(response => response.json())
            .then((data) => {
                TileMgr.get().setTileTypes(data['tileTypes']);
                gameScreen.placeEnemies();
                gameScreen.gameData['loaded'] = true;
                gameScreen.sceneTimer.start();
            });
        });
    }
    loadRandomLevelAsteroids() {
        const MAX_COLS = 128,
              MIN_COLS = 96,
              MAX_E_FREQ = 8,
              MIN_E_FREQ = 4,
              /* calculate ratio between 1 column and 1 enemy frequency */
              STEP = (MAX_E_FREQ - MIN_E_FREQ) / (MAX_COLS - MIN_COLS);

        let tiles = Array.from({length: 8}, () => []),
            lastTile = -1,
            curTile = -1,
            lastSTile = -1,
            sAccum = 0,
            numCols = randInt(MIN_COLS, MAX_COLS);
        /*
            clamp the enemy placement frequency between 8 and 4 depending
            on level size; smaller number denotes more enemies:

            level size:      128 120 112 104 96
            enemy frequency: 8   7   6   5   4
        */
        let eFrequency = MAX_E_FREQ - Math.round((MAX_COLS - numCols) * STEP);

        /* generate random tiles */
        for (let col = 0; col < numCols; ++col) {
            for (let row = 0, numRows = 8; row < numRows; ++row) {
                curTile = randInt(0, 4);
                if (curTile > 2) {
                    if (randInt(0, 9)) {
                        curTile -= 3;
                    }
                    else {
                        curTile = lastSTile == 3 ? 4 : 3;
                        if (++sAccum >= 20 && randBool()) {
                            curTile = 5;
                            sAccum = 0;
                        }
                        lastSTile = curTile;
                    }
                }
                else if (curTile > 0 && curTile == lastTile) {
                    curTile = curTile == 1 ? 2 : 1;
                }
                lastTile = curTile;
                tiles[row].push(curTile);
            }
        }
        /* add the goal tiles */
        for (let i = 0; i < 8; ++i) {
            tiles[i][numCols - 1] = 6;
        }
        
        TileMgr.get().setTiles(tiles);
        
        if (TileMgr.get().tilesLoaded()) {

            let levelWidth = TILE_SIZE * tiles[0].length;
            let numScreens = Math.ceil(levelWidth / (CANVAS_BASE_WIDTH * 0.25));
            for (let i = 0; i < numScreens; ++i) {
               this.gameData['screens'].push(
                   new Screen(
                       CANVAS_BASE_WIDTH * 0.25,
                       CANVAS_BASE_HEIGHT,
                       CANVAS_BASE_WIDTH * .125 + CANVAS_BASE_WIDTH * 0.25 * i,
                       0
                    )
                );
            }
            
            let xPoint = TILE_SIZE * 16, /* give Toady a safe starting zone */
                enemyObj = null,
                itemObj = null,
                eAccum = 0,
                stopWidth = levelWidth - TILE_SIZE * 12; /* place no objects at the ending zone */

            /* fill the level with asteroids */
            while (xPoint < stopWidth) {
                enemyObj = randAsteroid(xPoint, xPoint, 0, LEVEL_HEIGHT);
                if (Array.isArray(enemyObj)) {
                    for (let e of enemyObj) {
                        this.gameData['enemyFileData'].push(e);
                    }
                }
                else {
                    this.gameData['enemyFileData'].push(enemyObj);
                }
                xPoint += Asteroid.imgs[0].width;
                if (!(++eAccum % eFrequency)) {
                    this.gameData['enemyFileData'].push({ t: (randBool() ? "VectorToad" : "Clinger"), x: xPoint, y: randInt(0, LEVEL_HEIGHT) });
                }
                if (!(eAccum % 4)) {
                    itemObj = randItem(xPoint, xPoint + 100, 0, LEVEL_HEIGHT);
                    if (!itemObj)
                        continue;
                    if (Array.isArray(itemObj)) {
                        for (let e of itemObj) {
                            this.gameData['itemFileData'].push(e);
                        }
                    }
                    else {
                        this.gameData['itemFileData'].push(itemObj);
                    }                  
                }
            }

            this.gameData['levelName'] = '???????';
            this.draw = this.drawSplash;
            const gameScreen = this;
            fetch('./tile_data/space_tiles.json')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                TileMgr.get().setTileTypes(data['tileTypes']);
                gameScreen.placeEnemies();
                gameScreen.gameData['loaded'] = true;
                gameScreen.sceneTimer.start();
            });
        }
    }
    placeEnemies() {
        let screenInd = -1;
        if (this.gameData['enemyFileData']) {
            for (let e of this.gameData['enemyFileData']) {
                /* enemies are placed in the last screen initially */
                screenInd = this.gameData['screens'].length - 1;
                
                for (let i = 0, len = this.gameData['screens'].length; i < len; ++i) {
                    if (e.x >= this.gameData['screens'][i].left &&
                       e.x <= this.gameData['screens'][i].right) {
                        screenInd = i;
                        break;
                    }
                }

                /* a size property denotes that an asteroid should be created */
                if (e.size)
                    this.gameData['screens'][screenInd].addObj(OBJECT_FACTORY[e.t](e.x, e.y, e.size, e.xVel || 0, e.yVel || 0));
                else if (e.h) {
                    this.gameData['screens'][screenInd].addObj(OBJECT_FACTORY[e.t](e.x, e.y, e.h, e.v));
                }
                else
                    /* find a screen to put the enemy */
                    this.gameData['screens'][screenInd].addObj(OBJECT_FACTORY[e.t](e.x, e.y));
            }
        }
        
        let hasSecret = this.gameData['player'].hasSecret;
        if (this.gameData['itemFileData']) {
            for (let e of this.gameData['itemFileData']) {
                if (hasSecret && e.t == 'ShotSwap')
                    continue;
                screenInd = 0;
                for (let i = 0, len = this.gameData['screens'].length; i < len; ++i) {
                    if (e.x >= this.gameData['screens'][i].left &&
                       e.x <= this.gameData['screens'][i].right) {
                        screenInd = i;
                        break;
                    }
                }
                /* find a screen to put the item */
                this.gameData['screens'][screenInd].addObj(OBJECT_FACTORY[e.t](e.x, e.y));
            }
        }
        
        /* activate the first screens within the level's starting view */
        let offset = Math.min(
            Math.trunc((this.gameData['gameRect'].right) / (CANVAS_BASE_WIDTH * 0.25)),
            this.gameData['screens'].length - 1
        );
        for (; offset >= 0; --offset) {
            this.gameData['screens'][offset].activate(
                this.gameData['enemyList'],
                this.gameData['itemList']
            );
        }
    }
    resetLevel() {
        this.gameData['gameXPos'] = 0;
        this.gameData['player'].reset();
        this.gameData['gameRect'].setPos(CANVAS_BASE_WIDTH * 0.5 - 1, 0);
        this.gameData['enemyList'].clear();
        this.gameData['itemList'].clear();        

        ExpMgr.get().reset();
        TileMgr.get().resetScroll();
        
        for (let s of this.gameData['screens']) {
            s.reset();
        }
        this.placeEnemies();
        
        this.sceneTimer.start();
        this.draw = this.drawSplash;
    }
    resetGame() {
        this.gameData['player'].reset();
        this.gameData['enemyList'].clear();
        this.gameData['itemList'].clear(); 
        this.gameData['gameRect'].setPos(CANVAS_BASE_WIDTH * 0.5 - 1, 0);      
        this.gameData['screens'].length = 0;
        this.gameData['enemyFileData'].length = 0;
        this.gameData['itemFileData'].length = 0;
        this.gameData['gameXPos'] = 0;
        this.gameData['loaded'] = false;
        
        TileMgr.get().reset();
        
        this.loadLevel();
    }
    awardPoints() {
        this.scoreBonus = this.gameData['player'].hp * 60;
        
        this.gameData['player'].score += this.scoreBonus;

        /* do not store the player's score if the level completed
            was a secret level */
        if (this.gameData['isSecretLevel']) {
            return;
        }
        
        UserMgr.get().getData().score = this.gameData['player'].score;
        UserMgr.get().getData().shotType = this.gameData['player'].shotType;
        UserMgr.get().setHighScore(this.gameData['player'].score);
        
        if (localStorage) {
            localStorage.userData = UserMgr.get().getStringJSON();
            localStorage.highScore = UserMgr.get().getHighScore();
        }       
    }
    endLevel() {

        this.awardPoints();
        this.levelDone = true;

        const tempFn = this.sceneTimer.callback;
        
        this.sceneTimer.callback = function() {

            if (!this.gameData['isSecretLevel']) {
                UserMgr.get().getData().level = Math.min(UserMgr.get().getData().level + 1, MAX_LEVEL);
                this.sceneTimer.callback = tempFn;
                this.resetGame();
            }
            else {
                this.gameData['loaded'] = false;
                this.exitGameScreen();
                self.dispatchEvent(EVENT_GAME_DONE);
            }
        }.bind(this);
        this.sceneTimer.start();
    }
    exitGameScreen() {
        TileMgr.get().reset();
        ExpMgr.get().reset();
        this.gameCanvas.removeEventListener('touchstart', this.touchStartFn, false);
        this.gameCanvas.removeEventListener('touchend', this.touchEndFn, false);
        this.gameCanvas.removeEventListener('touchmove', this.touchMoveFn, false);
        self.removeEventListener('bossdone', this.bossDoneFn, false);
    }
};