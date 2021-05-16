import {Enemy} from '../enemies/base_enemy.js';
import {Item} from '../items/item_base.js';
import {Rect} from '../rect.js';

import {Lava} from '../enemies/lava.js';

export const Screen = class extends Rect {
    constructor(width, height, x = 0, y = 0) {
        super(width, height, x, y);
        this.objs = new Set();
        this.active = false;
    }
    activate(dest, itemDest) {
        if (!this.active) {
            this.active = true;
            this.objs.forEach(val => {
                (val instanceof Enemy || val instanceof Lava) && dest.add(val);
            }, dest);
            this.objs.forEach(val => {
                val instanceof Item && itemDest.add(val);
            }, itemDest);
        }
    }
    addObj(obj) {
        if (this.objs.size < 50) {
            this.objs.add(obj);
        }
    }
    reset() {
        this.objs.clear();
        this.active = false;
    }
};