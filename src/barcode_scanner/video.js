import {
    CANVAS_BASE_HEIGHT,
    CANVAS_BASE_WIDTH,
    EVENT_CAMERA_DONE
} from '../gameplay_constants.js';

export const BarcodeMgr = (() => {
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
            window.stream.getTracks().forEach(function (track) {
                track.stop();
            });
        }

        const constraints = {
            video: {
                deviceId: { exact: videoSelect.value }
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
        /* make stream available to console */
        window.stream = stream;
        videoElement.srcObject = stream;
    };

    const decodeCallback = (ptr, len, resultIndex, resultCount) => {
        const result = new Uint8Array(ZXing.HEAPU8.buffer, ptr, len);
        console.log(String.fromCharCode.apply(null, result));
        barcode = String.fromCharCode.apply(null, result);
    };

    const handleError = (error) => {
        console.log('Error: ', error);
    };

    if (typeof window.ZXing === 'function') {
        ZXing = window.ZXing();
        decodePtr = ZXing.Runtime.addFunction(decodeCallback);
    }

    isPC = browserRedirect() === 'pc';

    navigator.mediaDevices.enumerateDevices()
        .then(gotDevices)
        .then(getStream)
        .catch(handleError);

    videoSelect.onchange = getStream;

    return Object.freeze({
        getBarcode() {
            return barcode;
        },
        hideCamera() {
            scannerPaused = true;
            document.getElementById('camera-area').style.display = 'none';
            self.dispatchEvent(EVENT_CAMERA_DONE);
        },
        resetBarcode() {
            barcode = '';
        },
        scanBarcode() {
            if (scannerPaused) {
                console.warn('Can\'t scan because ZXing is paused.');
                return;
            }

            if (ZXing == null) {
                console.warn('Can\'t scan because ZXing is not ready.');
                return;
            }

            let context = null,
                width = 0,
                height = 0,
                dbrCanvas = null;

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
            // console.log("video width: " + vid.videoWidth + ", height: " + vid.videoHeight);

            const barcodeCanvas = document.createElement("canvas");
            barcodeCanvas.width = vid.videoWidth;
            barcodeCanvas.height = vid.videoHeight;

            const barcodeContext = barcodeCanvas.getContext('2d');

            const imageWidth = vid.videoWidth, imageHeight = vid.videoHeight;

            barcodeContext.drawImage(videoElement, 0, 0, imageWidth, imageHeight);

            try {
                /* read barcode */
                const imageData = barcodeContext.getImageData(0, 0, imageWidth, imageHeight),
                    idd = imageData.data,
                    image = ZXing._resize(imageWidth, imageHeight);

                for (let i = 0, j = 0; i < idd.length; i += 4, j++) {
                    ZXing.HEAPU8[image + j] = idd[i];
                }

                const err = ZXing._decode_any(decodePtr);

                // console.log("error code", err);
                if (err !== 0) {
                    console.warn('Barcode scan failed... try again.')
                }
                else {
                    BarCodeMgr.hideCamera();
                }
            }
            catch (e) {
                return;
            }
        },
        showCamera() {
            document.getElementById('camera-area').style.display = 'block';
            scannerPaused = false;
        }
    });
})();