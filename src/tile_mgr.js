import {getImg} from './utilities.js';

import {CANVAS_BASE_WIDTH} from './gameplay_constants.js';

export const TILE_SIZE = 40;

export const TILE_TYPES = Object.freeze({
    "TILE_PASS": 0x1,
    "TILE_WALL": 0x2,
    "TILE_GOAL": 0x4,
    "TILE_DASH_RIGHT": 0x8,
    "TILE_HAZARD": 0x10
});

export const TILE_BIT_TOTAL = Object.values(TILE_TYPES).reduce((total, val) => total |= val);

const TileType = class {
    constructor(src, type) {
        this.img = getImg(src);
        this.type = TILE_TYPES[type];
    }
};

export const TileMgr = {
    instance: null,
    createInstance() {
        let TM_tileTypes = [],
            TM_tileDrawLimit = 0,
            TM_tiles = [],
            TM_tilesPerRow = CANVAS_BASE_WIDTH / TILE_SIZE,
            TM_tileXDrawOffset = 0,
            TM_scrollDone = false,
            TM_scrollX = 0,
            TM_numCols = 0,

            isWrapDone = false,
            wraps = true,
            wrapped = false;

        return {
            setTileTypes(tileTypes) {
                for (let i = 0, numTypes = tileTypes.length; i < numTypes; ++i) {
                    TM_tileTypes.push(
                        new TileType('./images/tiles/' + tileTypes[i].src,
                        tileTypes[i].type)
                    );
                }
                // console.log('tilemgr', TM_tileTypes);
            },
            setTiles(tiles) {
                console.log('tilemgr', tiles);
                for (const t of tiles) {
                    TM_tiles.push(t);
                }

                TM_numCols = TM_tiles[0].length;
            },
            setTile(row, col, type) {
                try {
                    TM_tiles[Math.trunc(col / TILE_SIZE)]
                        [Math.trunc(row / TILE_SIZE)] = type;

                    if (type === undefined) {
                        throw TypeError;
                    }
                }
                catch (TypeError) {
                    return;
                }               
            },
            getPointTileType(x, y) {
                try {
                    let type = TM_tiles[Math.trunc(y / TILE_SIZE)]
                                        [Math.trunc(x / TILE_SIZE)];

                    if (type === undefined) {
                        throw TypeError;
                    }

                    return type;
                }
                catch (TypeError) {
                    return 0;
                }
            },
            getTileType(index) {
                try {
                    return TM_tileTypes[index].type;
                }
                catch (RangeError) {
                    return 0;
                }
            },
            getIsWrapDone() {
                return wraps && isWrapDone;
            },
            draw(context) {
                let dc = 0;
                try {
                    for (let row = 0; row < TM_tiles.length; ++row) {
                        for (let col = TM_tileXDrawOffset; col < TM_tileDrawLimit + 1; ++col) {
                            ++dc;
                            context.drawImage(
                                TM_tileTypes[TM_tiles[row][col]].img,
                                TILE_SIZE * col - TM_scrollX,
                                TILE_SIZE * row
                            );
                        }
                    }
                }
                catch (e) {
                    debugger;
                }

                if (dc === 0) {
                    // debugger;
                }
            },
            update(data) {
                if (!TM_scrollDone) {
                    TM_tileXDrawOffset = ~~Math.abs(data['gameXPos'] / TILE_SIZE);
                    TM_tileDrawLimit = TM_tilesPerRow + TM_tileXDrawOffset;
                    TM_scrollX = data['gameXPos'];

                    /* check if the end of the level has been reached */
                    if (TM_tileDrawLimit >= TM_numCols) {
                    //     console.log('gameXPos', data['gameXPos']);
                    //     if (wrapped) {

                    //         wrapped = false;
                    //         // data['gameXPos'] -= (TM_tilesPerRow + 1) * TILE_SIZE;
                    //         data['gameXPos'] = data['player'].x;

                    //         TM_tileDrawLimit = TM_tilesPerRow;
                    //         TM_tileXDrawOffset = ~~Math.abs(data['gameXPos'] / TILE_SIZE);
                    //         TM_scrollX = data['gameXPos'];

                    //         for (let i = 0; i < TM_tiles.length; ++i) {
                    //             TM_tiles[i] = TM_tiles[i].slice(TM_tilesPerRow + 1);
                    //         }
                    //     }
                    //     else if (0 && wraps) {
                    //         wrapped = true;
                    //         isWrapDone = false;
                    //         for (const tileRow of TM_tiles) {
                    //             tileRow.push(
                    //                 ...Array.from(
                    //                     {length: TM_tilesPerRow + 1},
                    //                     (_, index) => tileRow[index]
                    //                 )
                    //             )
                    //         }
                    //     }
                    //     else {
                            TM_scrollDone = true;

                            /* draw one fewer column because the level
                                is no longer scrolling */
                            --TM_tileDrawLimit;
                    //     }
                    }
                }
            },
            isDone() { return TM_scrollDone; },
            tilesLoaded() { return TM_tiles.length; },
            resetScroll() { TM_scrollDone = false; },
            reset() {
                TM_tileTypes.length = 0;
                TM_tiles.length = 0;
                TM_scrollDone = false;
                TM_numCols = 0;
            }
        };
    },
    get() {
        if (!this.instance) {
            this.instance = this.createInstance(CANVAS_BASE_WIDTH / TILE_SIZE);
        }
        return this.instance;
    }
};

export const checkTileBits = (...tiles) => {
    let result = 0x0;
    for (let t of tiles) {
        result |= (TileMgr.get().getTileType(t) & TILE_BIT_TOTAL);
    }
    return result;
};