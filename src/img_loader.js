export const removeDirectories = (str, sep) => {
    return str.substr(str.lastIndexOf(sep) + 1);
};

export const removeExtension = (str) => {
    return str.substr(0,str.lastIndexOf('.'));
};

export const getBaseName = (str, sep = '/') => {
    return removeExtension(removeDirectories(str, sep));
};

export const ImgLoader = Object.seal({
    cache: Object.create(null),
    async loadImages(...filenames) {
        return new Promise((resolve) => {

            /* get unique filenames and those that don't correspond with a loaded image */
            const uniqueFilenames = Array.from(new Set(filenames))
            .filter(filename => !(ImgLoader.getImg(getBaseName(filename)) instanceof HTMLImageElement));

            if (uniqueFilenames.length === 0) {
                resolve();
            }

            let numLoaded = 0;

            uniqueFilenames.forEach(f => {
    
                ++numLoaded;

                const onLoad = () => {
                    this.cache[key] = img instanceof HTMLImageElement ?
                        img : this.cache['placeholder'];

                    if (--numLoaded == 0) {
                        resolve();
                    }
                };
    
                const key = getBaseName(f),
                    img = new Image();
    
                img.src = f;
                img.addEventListener('load', onLoad, {bubbles: false, once: true});
                img.addEventListener('error', onLoad, {baseFileName: f, bubbles: false, once: true});
            });
        });
    }
});