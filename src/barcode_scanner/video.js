import {
    CANVAS_BASE_HEIGHT,
    CANVAS_BASE_WIDTH,
    EVENT_CAMERA_DONE
} from '../gameplay_constants.js';

export const BarcodeMgr = {
    instance: null,
    createInstance() {

        /* private variables */
        const videoElement = document.querySelector('video'),
            canvas = document.getElementById('buffer'),
            ctx = canvas.getContext('2d'),
            mobileCanvas = document.getElementById('game-canvas'),
            mobileCtx = mobileCanvas.getContext('2d'),
            videoSelect = document.getElementById('video-source'),
            videoWidth = CANVAS_BASE_WIDTH * .5,
            videoHeight = CANVAS_BASE_HEIGHT * .5,
            mobileVideoWidth = CANVAS_BASE_WIDTH * .5,
            mobileVideoHeight = CANVAS_BASE_HEIGHT * .5;

        let barcode = '',
            scannerPaused = true,
            isPC = true,
            decodePtr = null,
            ZXing = null;

        /* private methods */
        const browserRedirect = () => {
            const sUserAgent = navigator.userAgent.toLowerCase(),
                bIsIpad = sUserAgent.match(/ipad/i) == "ipad",
                bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os",
                bIsMidp = sUserAgent.match(/midp/i) == "midp",
                bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
                bIsUc = sUserAgent.match(/ucweb/i) == "ucweb",
                bIsAndroid = sUserAgent.match(/android/i) == "android",
                bIsCE = sUserAgent.match(/windows ce/i) == "windows ce",
                bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
            let deviceType = '';
            if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
                deviceType = 'phone';
            } else {
                deviceType = 'pc';
            }
            return deviceType;
        };

        /* see https://github.com/samdutton/simpl/tree/gh-pages/getusermedia/sources */
        const getStream = () => {
            if (window.stream) {
                window.stream.getTracks().forEach(function(track) {
                    track.stop();
                });
            }
        
            const constraints = {
                video: {
                    deviceId: {exact: videoSelect.value}
                }
            };
        
            navigator.mediaDevices.getUserMedia(constraints)
            .then(gotStream)
            .catch(handleError);
        };

        const gotDevices = (deviceInfos) => {
            for (let i = deviceInfos.length - 1; i >= 0; --i) {
        
                const deviceInfo = deviceInfos[i],
                    option = document.createElement('option');
        
                option.value = deviceInfo.deviceId;
        
                if (deviceInfo.kind === 'videoinput') {
                    option.text = deviceInfo.label || 'camera ' +
                    (videoSelect.length + 1);
                    videoSelect.appendChild(option);
                }
            }
        };

        const gotStream = (stream) => {
            window.stream = stream; // make stream available to console
            videoElement.srcObject = stream;
        };

        const decodeCallback = (ptr, len, resultIndex, resultCount) => {
            const result = new Uint8Array(ZXing.HEAPU8.buffer, ptr, len);
            console.log(String.fromCharCode.apply(null, result));
            barcode = String.fromCharCode.apply(null, result);
            
            hideCamera();
        };

        const handleError = (error) => {
            console.log('Error: ', error);
        };
        
        const tick = () => {
            if (typeof window.ZXing === 'function') {
                ZXing = window.ZXing();
                decodePtr = ZXing.Runtime.addFunction(decodeCallback);
            } else {
                setTimeout(tick, 10);
            }
        };

        const scanBarcode = () => {
            if (scannerPaused) {
                console.log('Can\'t scan because ZXing is paused.');
                return;
            }
        
            if (ZXing == null) {
                // Barcode Reader is not ready!
                console.log('Can\'t scan because ZXing is not ready.');
                return;
            }
        
            let context = null,
                width = 0,
                height = 0;
        
            if (isPC) {
                context = ctx;
                width = videoWidth;
                height = videoHeight;
                dbrCanvas = canvas;
            } else {
                context = mobileCtx;
                width = mobileVideoWidth;
                height = mobileVideoHeight;
                dbrCanvas = mobileCanvas;
            }
        
            context.drawImage(videoElement, 0, 0, width, height);
        
            const vid = document.getElementById("video");
            console.log("video width: " + vid.videoWidth + ", height: " + vid.videoHeight);
        
            const barcodeCanvas = document.createElement("canvas");
            barcodeCanvas.width = vid.videoWidth;
            barcodeCanvas.height = vid.videoHeight;
        
            const barcodeContext = barcodeCanvas.getContext('2d');
        
            const imageWidth = vid.videoWidth, imageHeight = vid.videoHeight;
        
            barcodeContext.drawImage(videoElement, 0, 0, imageWidth, imageHeight);
            
            try {
            
                // read barcode
                const imageData = barcodeContext.getImageData(0, 0, imageWidth, imageHeight),
                    idd = imageData.data,
                    image = ZXing._resize(imageWidth, imageHeight);
        
                console.time("decode barcode");
        
                for (let i = 0, j = 0; i < idd.length; i += 4, j++) {
                    ZXing.HEAPU8[image + j] = idd[i];
                }
        
                const err = ZXing._decode_any(decodePtr);
        
                console.timeEnd('decode barcode');
        
                console.log("error code", err);
                if (err == -2) {
                    setTimeout(scanBarcode, 30);
                }
            }
            catch (e) {
                return;
            }
        };

        /* immediate function calls */
        tick();

        isPC = browserRedirect() === 'pc';

        navigator.mediaDevices.enumerateDevices()
        .then(gotDevices)
        .then(getStream)
        .catch(handleError);

        videoSelect.onchange = getStream;

        return {
            getBarcode() {
                return barcode;
            },
            hideCamera() {
                scannerPaused = true;
                document.getElementById('game-canvas').style.display = 'block';
                document.getElementById('camera-area').style.display = 'none';
                self.dispatchEvent(EVENT_CAMERA_DONE);
            },
            resetBarcode() {
                barcode = '';
            },
            scan() {
                console.log('Attempting to scan...');
                scannerPaused = false;
                scanBarcode();
            }
        };
    },
    get() {
        if (!this.instance) {
            this.instance = this.createInstance();
        }
        return this.instance;
    }
};

// let scannerPaused = false;

// let isPC = true;

// let decodePtr = null;

// let ZXing = null;

// export let barcode_result = '';

// export const hideCamera = () => {
//     scannerPaused = true;
//     document.getElementById('game-canvas').style.display = 'block';
//     document.getElementById('camera-area').style.display = 'none';
//     self.dispatchEvent(EVENT_CAMERA_DONE);
// };

// export const scan = () => {
//     console.log('Attempting to scan...');
//     scannerPaused = false;
//     scanBarcode();
// };

// const videoElement = document.querySelector('video');

// const canvas = document.getElementById('buffer');
// const ctx = canvas.getContext('2d');

// const mobileCanvas = document.getElementById('game-canvas');

// const mobileCtx = mobileCanvas.getContext('2d');

// // https://github.com/samdutton/simpl/tree/gh-pages/getusermedia/sources
// const videoSelect = document.querySelector('select#video-source');

// const videoWidth = CANVAS_BASE_WIDTH * .5,
//     videoHeight = CANVAS_BASE_HEIGHT * .5;

// const mobileVideoWidth = CANVAS_BASE_WIDTH * .5,
//     mobileVideoHeight = CANVAS_BASE_HEIGHT * .5;

// let scannerPaused = false;

// let isPC = true;

// let decodePtr = null;

// let ZXing = null;

// const tick = () => {
//     if (typeof window.ZXing === 'function') {
//         debugger;
//         ZXing = window.ZXing();
//         decodePtr = ZXing.Runtime.addFunction(decodeCallback);
//     } else {
//         setTimeout(tick, 10);
//     }
// };

// const decodeCallback = (ptr, len, resultIndex, resultCount) => {
//     const result = new Uint8Array(ZXing.HEAPU8.buffer, ptr, len);
//     console.log(String.fromCharCode.apply(null, result));
//     barcode_result = String.fromCharCode.apply(null, result);
    
//     hideCamera();
// };

// // check devices
// const browserRedirect = () => {
//     const sUserAgent = navigator.userAgent.toLowerCase(),
//         bIsIpad = sUserAgent.match(/ipad/i) == "ipad",
//         bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os",
//         bIsMidp = sUserAgent.match(/midp/i) == "midp",
//         bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
//         bIsUc = sUserAgent.match(/ucweb/i) == "ucweb",
//         bIsAndroid = sUserAgent.match(/android/i) == "android",
//         bIsCE = sUserAgent.match(/windows ce/i) == "windows ce",
//         bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
//     let deviceType = '';
//     if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
//         deviceType = 'phone';
//     } else {
//         deviceType = 'pc';
//     }
//     return deviceType;
// }

// // stackoverflow: http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata/5100158
// const dataURItoBlob = (dataURI) => {
//     // convert base64/URLEncoded data component to raw binary data held in a string
//     let byteString = null;

//     if (dataURI.split(',')[0].indexOf('base64') >= 0)
//         byteString = atob(dataURI.split(',')[1]);
//     else
//         byteString = unescape(dataURI.split(',')[1]);

//     // separate out the mime component
//     const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

//     // write the bytes of the string to a typed array
//     const ia = new Uint8Array(byteString.length);
//     for (let i = 0; i < byteString.length; i++) {
//         ia[i] = byteString.charCodeAt(i);
//     }

//     return new Blob([ia], {
//         type: mimeString
//     });
// };

// // scan barcode
// const scanBarcode = () => {
//     if (scannerPaused) {
//         console.log('Can\'t scan because the ZXing is paused.');
//         return;
//     }

//     if (ZXing == null) {
//         // Barcode Reader is not ready!
//         console.log('Can\'t scan because the ZXing is not ready.');
//         return;
//     }

//     let context = null,
//         width = 0,
//         height = 0,
//         dbrCanvas = null;

//     if (isPC) {
//         context = ctx;
//         width = videoWidth;
//         height = videoHeight;
//         dbrCanvas = canvas;
//     } else {
//         context = mobileCtx;
//         width = mobileVideoWidth;
//         height = mobileVideoHeight;
//         dbrCanvas = mobileCanvas;
//     }

//     context.drawImage(videoElement, 0, 0, width, height);

//     const vid = document.getElementById("video");
//     console.log("video width: " + vid.videoWidth + ", height: " + vid.videoHeight);

//     const barcodeCanvas = document.createElement("canvas");
//     barcodeCanvas.width = vid.videoWidth;
//     barcodeCanvas.height = vid.videoHeight;

//     const barcodeContext = barcodeCanvas.getContext('2d');

//     const imageWidth = vid.videoWidth, imageHeight = vid.videoHeight;

//     barcodeContext.drawImage(videoElement, 0, 0, imageWidth, imageHeight);
    
//     try {
    
//         // read barcode
//         const imageData = barcodeContext.getImageData(0, 0, imageWidth, imageHeight),
//             idd = imageData.data,
//             image = ZXing._resize(imageWidth, imageHeight);

//         console.time("decode barcode");

//         for (let i = 0, j = 0; i < idd.length; i += 4, j++) {
//             ZXing.HEAPU8[image + j] = idd[i];
//         }

//         const err = ZXing._decode_any(decodePtr);

//         console.timeEnd('decode barcode');

//         console.log("error code", err);
//         if (err == -2) {
//             setTimeout(scanBarcode, 30);
//         }
//     }
//     catch (e) {
//         return;
//     }
// };

// const gotDevices = (deviceInfos) => {
//     for (let i = deviceInfos.length - 1; i >= 0; --i) {

//         const deviceInfo = deviceInfos[i],
//             option = document.createElement('option');

//         option.value = deviceInfo.deviceId;

//         if (deviceInfo.kind === 'videoinput') {
//             option.text = deviceInfo.label || 'camera ' +
//             (videoSelect.length + 1);
//             videoSelect.appendChild(option);
//         }
//     }
// };

// const getStream = () => {
//     if (window.stream) {
//         window.stream.getTracks().forEach(function(track) {
//             track.stop();
//         });
//     }

//     const constraints = {
//         video: {
//             deviceId: {exact: videoSelect.value}
//         }
//     };

//     navigator.mediaDevices.getUserMedia(constraints).
//     then(gotStream).catch(handleError);
// };

// const gotStream = (stream) => {
//     window.stream = stream; // make stream available to console
//     videoElement.srcObject = stream;
// };

// const handleError = (error) => {
//   console.log('Error: ', error);
// };

// /* immediate function calls */
// tick();

// if (browserRedirect() == 'pc') {
//     isPC = true;
// }
// else {
//     isPC = false;
// }

// navigator.mediaDevices.enumerateDevices()
//   .then(gotDevices).then(getStream).catch(handleError);

// videoSelect.onchange = getStream;