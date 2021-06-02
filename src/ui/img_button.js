import {Button} from './button.js';

import {getImg} from '../utilities.js';

export const ImgButton = class extends Button {
    constructor(filename, clickFn, width, height, x = 0, y = 0, upFn = null) {
        super(clickFn, width, height, x, y, upFn);
        this.img = getImg(filename);
        this.tapObj = null;
    }
    draw(context) {
        context.drawImage(this.img, this.left, this.top);
    }
    setTapObj(tapObj) {
        if (!this.tapObj) {
            this.tapObj = tapObj;
        }
    }
};