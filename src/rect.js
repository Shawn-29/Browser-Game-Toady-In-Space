export const Rect = class {
    constructor(width, height, x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.setBounds(width, height);
    }
    move(xMove, yMove) {
        this.x += xMove; this.left += xMove; this.right += xMove;
        this.y += yMove; this.top += yMove; this.bot += yMove;
    }
    setBounds(width, height) {
        this.left = ~~(this.x - width * 0.5);
        this.right = ~~(this.x + width * 0.5);
        this.top = ~~(this.y - height * 0.5);
        this.bot = ~~(this.y + height * 0.5);
        return this;
    }
    setPos(x, y) {
        let tempW = this.x - this.left;
        let tempH = this.y - this.top;
        this.x = x;
        this.y = y;
        this.left = x - tempW;
        this.right = x + tempW;
        this.y = y;
        this.top = y - tempH;
        this.bot = y + tempH;
        return this;
    }
    update(dt, data = null) {
        return;
    }
    draw(context, xOffset = 0) {
        context.fillStyle = "rgba(0, 255, 255, 0.60)";
        context.fillRect(this.left, this.top, this.right - this.left, this.bot - this.top);
    }
    collCheck(rect, xOffset = 0) {
        const adjRect = new Rect(this.right - this.left, this.bot - this.top,
                      this.x + xOffset, this.y);
        return (((adjRect.left >= rect.left && adjRect.left <= rect.right) ||
               (adjRect.right >= rect.left && adjRect.right <= rect.right) || (adjRect.x >= rect.left && adjRect.x <= rect.right)) &&
               ((adjRect.top >= rect.top && adjRect.top <= rect.bot) ||
                (adjRect.bot >= rect.top && adjRect.bot <= rect.bot) ||
               (adjRect.y >= rect.top && adjRect.y <= rect.bot)))
    }
    static checkPoint(x, y, rect, xOffset = 0) {
        return x >= rect.left + xOffset && x <= rect.right + xOffset &&
               y >= rect.top && y <= rect.bot;
    }
    static checkPointsAgainst(rect, other, xOffset = 0) {
        return Rect.checkPoint(rect.x, rect.y, other, xOffset) ||
            Rect.checkPoint(rect.left, rect.top, other, xOffset) ||
            Rect.checkPoint(rect.right, rect.top, other, xOffset) ||
            Rect.checkPoint(rect.left, rect.bot, other, xOffset) ||
            Rect.checkPoint(rect.right, rect.bot, other, xOffset);
    }
};