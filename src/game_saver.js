export const GameSaver = (() => {
    const localStorageEnabled = !!(navigator.cookieEnabled && window.localStorage);
    return Object.freeze({
        isEnabled() {
            return localStorageEnabled;
        },
        saveValue(key, value) {
            try {
                if (!localStorageEnabled) {
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
                if (!localStorageEnabled) {
                    return null;
                }
                return window.localStorage.getItem(key);
            } catch (error) {
                return null;
            }
        }
    });
})();