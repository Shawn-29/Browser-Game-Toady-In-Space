import {TILE_SIZE} from './tile_mgr.js';

export const BASE_MOVE_VEL = 300,
    CANVAS_BASE_WIDTH = 640,
    CANVAS_BASE_HEIGHT = 360,
    DASH_BOOST = 10,
    LEVEL_HEIGHT = CANVAS_BASE_HEIGHT - TILE_SIZE,
    WALL_DMG = 25,
    HAZARD_DMG = 35,
    MAX_SCORE_DIGITS = 6,
    RAD_2_DEGS = Math.PI / 180,
    MAX_PATHS = 3,
    MAX_LEVEL = 5;

export const EVENT_GAME_DONE = new CustomEvent('gamedone', { detail: null }),
    EVENT_CAMERA_DONE = new CustomEvent('cameradone'),
    EVENT_BOSS_DONE = new CustomEvent('bossdone'),
    EVENT_CREDITS_START = new CustomEvent('creditsstart');