import {CoinG} from './coin_green.js';

import {randInt} from '../utilities.js';

export const randItem = (x1, x2, y1, y2) => {
    let xRange = randInt(x1, x2),
        yRange = randInt(y1, y2);
    switch (randInt(1, 35)) {
        case 0:
        case 1:
            xRange = randInt(x1, x2 - (CoinG.imgs[0].width << 1));
            return [{ t: 'CoinG', x: xRange, y: yRange },
                    { t: 'CoinG', x: xRange + CoinG.imgs[0].width + 10, y: yRange },
                    { t: 'CoinG', x: xRange + (CoinG.imgs[0].width << 1) + 20, y: yRange }
                    ];
        case 2:
        case 3:
            yRange = randInt(y1, y2 - (CoinG.imgs[0].height << 1));
            return [{ t: 'CoinG', x: xRange, y: yRange },
                    { t: 'CoinG', x: xRange, y: yRange + CoinG.imgs[0].height + 10 },
                    { t: 'CoinG', x: xRange, y: yRange + (CoinG.imgs[0].height << 1) + 20 }
                    ];
        case 4:
            return [{ t: 'CoinR', x: xRange, y: yRange },
                    { t: 'CoinR', x: xRange + CoinG.imgs[0].width + 10, y: yRange },
                    ];
        case 5:
            yRange = randInt(y1, y2 - CoinG.imgs[0].height);
            return [{ t: 'CoinR', x: xRange, y: yRange },
                    { t: 'CoinR', x: xRange, y: yRange + CoinG.imgs[0].height + 10 }
                    ];
        case 6:
            return { t: 'CoinY', x: xRange, y: yRange };
        case 7:
            return { t: 'CoinP', x: xRange, y: yRange };
        case 8:
            return { t: 'CoinS', x: xRange, y: yRange };
        case 9:
            return { t: 'BombRefill', x: xRange, y: yRange };
        case 11:
            return { t: 'SpeedBoost', x: xRange, y: yRange };
        case 12:
        case 13:
        case 14:
        case 15:
        case 16:
            return { t: 'ShotSwap', x: xRange, y: yRange };
    }
};