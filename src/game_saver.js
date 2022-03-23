export const GameSaver = (() => {
    const isEnabled = () => {
        try {
            const testKeyVal = 'gameSaverStorageTest';

            /* check if local storage is enabled */
            if (!(navigator.cookieEnabled &&
                window.localStorage)) {
                return false;
            }

            /* check if local storage functionality works */
            window.localStorage.setItem(testKeyVal, testKeyVal);
            if (window.localStorage.getItem(testKeyVal) !== testKeyVal) {
                return false;
            }
            window.localStorage.removeItem(testKeyVal);

            return true;
        } catch (error) {
            return false;
        }
    };
    return Object.freeze({
        isEnabled: isEnabled(),
        saveValue(key, value) {
            try {
                if (!this.isEnabled) {
                    return false;
                }
                window.localStorage.setItem(key, value);
                return true;
            } catch (error) {
                return false;
            }
        },
        getValue(key) {
            try {
                if (!this.isEnabled) {
                    return null;
                }
                return window.localStorage.getItem(key);
            } catch (error) {
                return null;
            }
        },
        removeItem(key) {
            try {
                if (!this.isEnabled || this.getValue(key) === null) {
                    return false;
                }
                window.localStorage.removeItem(key);
                return true;
            } catch (error) {
                return false;
            }
        }
    });
})();