import {BarcodeMgr} from './barcode_scanner/video.js';
import {CreditsScreen} from './screens/credits_screen.js';
import {GameScreen} from './screens/game_screen.js';
import {OptionsScreen} from './screens/options_screen.js';
import {TitleScreen} from './screens/title_screen.js';

import {getTimestamp} from './utilities.js';
// import {hideCamera, scan} from './barcode_scanner/video.js';

import {CANVAS_BASE_HEIGHT, CANVAS_BASE_WIDTH} from './gameplay_constants.js';

self.onload = () => {
    const gameCanvas = document.getElementById('game-canvas'),
        context = gameCanvas.getContext("2d"),
        btnCancelScan = document.getElementById('btn-cancel-scan'),
        btnScan = document.getElementById('btn-scan');

    let curScreen = null;
    
    const resizeGame = () => {

        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        /* determine game size */
        if (CANVAS_BASE_HEIGHT / CANVAS_BASE_WIDTH > viewport.height / viewport.width) {
            window.newGameHeight = viewport.height;
            window.newGameWidth = window.newGameHeight * CANVAS_BASE_WIDTH / CANVAS_BASE_HEIGHT;  
        } else {
            window.newGameWidth = viewport.width;
            window.newGameHeight = newGameWidth * CANVAS_BASE_HEIGHT / CANVAS_BASE_WIDTH;
        }
        
        gameCanvas.style.width = window.newGameWidth + "px";
        gameCanvas.style.height = window.newGameHeight + "px";

        window.newGameX = (viewport.width - window.newGameWidth) / 2;
        window.newGameY = (viewport.height - window.newGameHeight) / 2;
        
        /* pad the game window for centering */
        gameCanvas.style.padding = window.newGameY + "px " + window.newGameX + "px";
        
    };
    
    self.addEventListener('resize', resizeGame);
    self.addEventListener('orientationchange', resizeGame);

    btnScan.addEventListener('click', BarcodeMgr.get().scan, false);
    btnCancelScan.addEventListener('click', BarcodeMgr.get().hideCamera, false);
    
    resizeGame();
    
    curScreen = new TitleScreen();
    
    let now,
        deltaTime = 0,
        last = getTimestamp(),
        timeStep = 1 / 60;
      
    const main = () => {
        now = getTimestamp();

        /* limit the delta time to one second in case the browser
            loses focus then the user returns to it */
        deltaTime = deltaTime + Math.min(1, (now - last) / 1000.0);

        /* update the game based on a fixed time step */
        while(deltaTime > timeStep) {
            deltaTime = deltaTime - timeStep;
            curScreen.update(timeStep, null);
        }

        curScreen.draw(context);
        last = now;
        requestAnimationFrame(main);
    };
        
    main();
    
    const screenTransition = (e) => {
        if (curScreen instanceof TitleScreen) {
            curScreen = new OptionsScreen(startGame);
            return;
        }
        curScreen.mouseDown(e);        
    };
    
    self.addEventListener('mousedown', screenTransition);

    self.addEventListener('gamedone', (e) => {
        curScreen = new TitleScreen();
        self.addEventListener('mousedown', screenTransition);
    });
    
    self.addEventListener('creditsstart', () => {
        curScreen = new CreditsScreen();
    });
    
    const startGame = () => {
        curScreen = new GameScreen(gameCanvas);
        curScreen.loadLevel();
    };
    
    //startGame(); // DEBUG
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./src/service_worker.js')
        .then((registration) => {
            console.log(registration.scope);
        });
    }
};