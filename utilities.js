import { RAD_2_DEGS } from './gameplay_constants.js';

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

export const getRandChoice = (...choices) => {

    const cache = new Map();

    let totalPerc = 0;
    for (const c of choices) {
        if (Array.isArray(c)) {
            totalPerc += Number.isFinite(c[1]) ? c[1] : 0;
            cache.set(c[0], totalPerc);
        }
    }

    if (totalPerc < 100) {
        const dist = Math.max(0, (100 - totalPerc) / (choices.length - cache.size));
        for (const c of choices) {
            if (!Array.isArray(c)) {
                totalPerc += dist;
                cache.set(c, totalPerc);
            }
        }
    }

    const chance = randInt(0, 100);
    for (const [key, value] of cache.entries()) {
        if (chance <= value) {
            return key;
        }
    }

    return null;
};

export const getTimestamp = () => {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();

    /* shorter syntax than above but lower browser support */
    // return window?.performance?.now?.() ?? new Date().getTime();
};

export const randBool = () => Math.random() >= .5;

export const randDouble = (min, max) => { return Math.random() * (max - min + 1) + min; };

export const randInt = (min, max) => { return ~~(Math.random() * (max - min + 1)) + min; };

export const drawTextWrap = (context, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
};

export const drawThemeText = (context, msg, x, y, size = '40px', font = 'Cooper Black') => {
    context.save();
    context.shadowColor = '#060';
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 4;
    context.lineWidth = 2;
    context.strokeStyle = '#060';
    context.fillStyle = '#ae0';
    context.textAlign = "center";
    context.font = `${size} ${font}`;
    context.strokeText(msg, x, y);
    context.fillText(msg, x, y + 4);
    context.restore();
};