import {RAD_2_DEGS} from './gameplay_constants.js';

export const drawHitFrame = (context, enemy, img, xOffset = 0) => {
    const bufferCanvas = document.getElementById("buffer"),
        buffer = bufferCanvas.getContext("2d");
    buffer.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
    buffer.save();
    buffer.fillStyle = 'rgba(255, 255, 255, 1)';
    buffer.fillRect(enemy.left - xOffset, enemy.top, enemy.right - xOffset, enemy.bot);
    buffer.globalCompositeOperation = 'destination-atop';
    buffer.drawImage(img, enemy.x - xOffset - img.width * 0.5, enemy.y - img.height * 0.5);
    buffer.restore();
    context.drawImage(bufferCanvas, 0, 0);
};

export const drawImgR = (ctx, image, x, y, w, h, degs) => {
    ctx.save();
    ctx.translate(x + (w >> 1), y + (h >> 1));
    ctx.rotate(degs * RAD_2_DEGS);
    ctx.translate(-x - (w >> 1), -y - (h >> 1));
    ctx.drawImage(image, x, y, w, h);
    ctx.restore();
};

export const getImg = (filename) => {
    const img = new Image();
    img.src = filename;
    return img;
};

export const getTimestamp = () => {
    return window?.performance?.now?.() ?? new Date().getTime();
};

export const randBool = () => Math.random() >= .5;

export const randDouble = (min, max) => { return Math.random() * (max - min + 1) + min; };

export const randInt = (min, max) => { return ~~(Math.random() * (max - min + 1)) + min; };