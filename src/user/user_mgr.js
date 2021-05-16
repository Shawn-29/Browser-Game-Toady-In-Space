import {MAX_SCORE_DIGITS} from '../gameplay_constants.js';

const User = class {
    constructor() {
        this.data = {
            shotType : 'Regular',
            score: 0,
            level: 1
        }
    }
};

export const UserMgr = (() => {
    let instance = null;
    const createInstance = () => {
        const users = Array.from({length: 3}, _ => new User());
        let highScore = '000000',
            activeInd = 0;
        return {
            setData(userInd, data) {
                users[userInd].data = data.data;
                activeInd = userInd;
            },
            setActiveUser(userInd) {
                activeInd = userInd;
            },
            setHighScore(amt) {
                let strAmt = String(amt);
                if (strAmt > highScore)
                    highScore = '0'.repeat(MAX_SCORE_DIGITS - strAmt.length) + strAmt;
            },
            clearData(userInd = null) {
                if (userInd != null)
                    users[userInd] = new User();
                else
                    users[activeInd] = new User();
            },
            getData(userInd = null) {
                if (userInd != null)
                    return users[userInd].data;
                return users[activeInd].data;
            },
            getActiveInd() { return activeInd; },
            getStringJSON() { return JSON.stringify(users); },
            getHighScore() { return highScore; }
        };
    };
    return {
        get() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    }
})();