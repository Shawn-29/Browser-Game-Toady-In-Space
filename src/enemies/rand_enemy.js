import {Asteroid} from './asteroid.js';
import {Domesworth} from './domesworth.js';
import {Philbert} from './philbert.js';

import {randInt} from '../utility.js';

export const randEnemy = (x1, x2, y1, y2) => {
    let xRange = randInt(x1, x2);
    let yRange = randInt(y1, y2);
    switch (randInt(1, 7)) {
        default:
        case 0:
            return { t: 'Domesworth', x: xRange, y: randInt(y1, y2) };
        case 1:
            return [ {t: 'Domesworth', x: xRange, y: randInt(y1, y1) },
                         {t: 'Domesworth', x: xRange + Domesworth.img.width + 20, y: randInt(y1, y1) }                        
                        ];
        case 2:
            return { t: 'Clinger', x: xRange, y: randInt(y1, y2) };
        case 3:
        case 4:
            return [ {t: 'Stretcher', x: xRange, y: randInt(y1, y2) },
                    {t: 'Stretcher', x: xRange + Domesworth.img.width + 20, y: randInt(y1, y2) }                        
                        ];
        case 5:
        case 6:
            return [ { t: 'Philbert', x: xRange, y: yRange },
                    { t: 'Philbert', x: xRange + Philbert.imgs[0].width + 20, y: randInt(y1, y2) }                  
                   ];
        case 7:
            return { t: 'VectorToad', x: xRange, y: randInt(y1, y2) };
    }
};

export const randAsteroid = (x1, x2, y1, y2) => {
    let xRange = randInt(x1, x2),
        yRange = -1;

    switch (randInt(0, 10)) {
        case 0:
            yRange = randInt(y1, y2 - (Asteroid.imgs[0].height >> 1));
            return [{ t: "Asteroid", x: xRange, y: yRange, size: "lg", xVel: randInt(-10, -20) },
                    { t: "Asteroid", x: xRange + Asteroid.imgs[0].width * randDouble(1, 5),
                     y: randInt(y1, y2 - (Asteroid.imgs[0].height >> 1)),size: "lg", xVel: randInt(-10, -20) }                    
                    ];
        case 1:
            yRange = randInt(y1, y2 - (Asteroid.imgs[0].height >> 1));
            return [{ t: "Asteroid", x: xRange, y: yRange, size: "lg", xVel: randInt(-60, -120) },
                    { t: "Asteroid", x: xRange + Asteroid.imgs[0].width * randDouble(1, 5),
                     y: randInt(y1, y2 - (Asteroid.imgs[0].height >> 1)), size: "lg", xVel: randInt(-60, -120) }                   
                   ];
        case 2:
            yRange = randInt(y1, y2 - (Asteroid.imgs[0].height >> 1));
            return [{ t: "Asteroid", x: xRange, y: yRange, size: "lg", xVel: randInt(-240, -300), yVel: randInt(0, 1) ? randInt(-80, 80) : 0 },
                    { t: "Asteroid", x: xRange + Asteroid.imgs[0].width * randDouble(1, 5),
                     y: randInt(y1, y2 - (Asteroid.imgs[0].height >> 1)), size: "lg",
                     xVel: randInt(-240, -300), yVel: randInt(0, 1) ? randInt(-80, 80) : 0 }                   
                   ];
        case 3:
        case 4:
        case 5:
            yRange = randInt(y1, y2 - Asteroid.imgs[1].height);
            return [{ t: "Asteroid", x: xRange, y: yRange, size: "sm", xVel: randInt(-10, -20) },
                    { t: "Asteroid", x: xRange + Asteroid.imgs[1].width * randDouble(1, 5),
                     y: randInt(y1, y2 - Asteroid.imgs[1].height), size: "sm", xVel: randInt(-10, -20) },
                    { t: "Asteroid", x: xRange + Asteroid.imgs[1].width * randDouble(1, 5),
                     y: randInt(y1, y2 - Asteroid.imgs[1].height), size: "sm", xVel: randInt(-10, -20) }
                    ];
        case 6:
        case 7:
        case 8:
            yRange = randInt(y1, y2 - Asteroid.imgs[1].height);
            return [{ t: "Asteroid", x: xRange, y: yRange, size: "sm", xVel: randInt(-20, -100) },
                    { t: "Asteroid", x: xRange,
                     y: randInt(y1, y2 - Asteroid.imgs[1].height), size: "sm", xVel: randInt(-20, -100) }                   
                    ];
        case 9:
        case 10:
            yRange = randInt(y1, y2 - Asteroid.imgs[1].height);
            return { t: "Asteroid", x: xRange, y: yRange, size: "in", xVel: randInt(-20, -100) };
    }
};