import { MAX_SCORE_DIGITS } from '../gameplay_constants.js';

const User = class {
    constructor() {
        this.data = {
            shotType: 'Regular',
            score: 0,
            level: 1
        };
    }
};

export const UserMgr = (() => {
    const users = Array.from({ length: 3 }, _ => new User());
    const boundsFail = index => index >>> 0 >= users.length;
    let highScore = '000000',
        activeInd = 0;
    return Object.freeze({
        setData(userInd, data) {
            if (boundsFail(userInd)) {
                return;
            }
            users[userInd].data = data.data;
            activeInd = userInd;
        },
        setActiveUser(userInd) {
            if (boundsFail(userInd)) {
                return;
            }
            activeInd = userInd;
        },
        setHighScore(amt) {
            const strAmt = String(Math.max(Math.min(999999, amt), 0));
            if (strAmt > highScore) {
                highScore = '0'.repeat(MAX_SCORE_DIGITS - strAmt.length) + strAmt;
            }
        },
        clearData(userInd = null) {
            if (userInd != null) {
                if (boundsFail(userInd)) {
                    return;
                }
                users[userInd] = new User();
            }
            else {
                users[activeInd] = new User();
            }
        },
        getData(userInd = null) {
            if (userInd != null) {
                if (boundsFail(userInd)) {
                    return null;
                }
                return users[userInd].data;
            }
            return users[activeInd].data;
        },
        getActiveInd() { return activeInd; },
        getStringJSON() { return JSON.stringify(users); },
        getHighScore() { return highScore; }
    });
})();