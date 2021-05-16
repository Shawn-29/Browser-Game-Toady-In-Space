import {ZXing} from './zxing.js'

import {
    CANVAS_BASE_HEIGHT,
    CANVAS_BASE_WIDTH,
    EVENT_CAMERA_DONE
} from '../gameplay_constants.js';

export let barcode_result = '';

export const hideCamera = () => {
    scannerPaused = true;
    document.getElementById('game-canvas').style.display = 'block';
    document.getElementById('camera-area').style.display = 'none';
    self.dispatchEvent(EVENT_CAMERA_DONE);
};

export const scan = () => {
    scannerPaused = false;
    scanBarcode();
};

const videoElement = document.querySelector('video');

const canvas = document.getElementById('buffer');
const ctx = canvas.getContext('2d');

const mobileCanvas = document.getElementById('game-canvas');

const mobileCtx = mobileCanvas.getContext('2d');

// https://github.com/samdutton/simpl/tree/gh-pages/getusermedia/sources
const videoSelect = document.querySelector('select#video-source');

const videoWidth = CANVAS_BASE_WIDTH * .5,
    videoHeight = CANVAS_BASE_HEIGHT * .5;

const mobileVideoWidth = CANVAS_BASE_WIDTH * .5,
    mobileVideoHeight = CANVAS_BASE_HEIGHT * .5;

let scannerPaused = false;

let isPC = true;

let scanner = null;

let decodePtr = null;

const tick = function () {
    if (window.ZXing) {
        scanner = ZXing();
        decodePtr = scanner.Runtime.addFunction(decodeCallback);
    } else {
        setTimeout(tick, 10);
    }
};

const decodeCallback = (ptr, len, resultIndex, resultCount) => {
    const result = new Uint8Array(scanner.HEAPU8.buffer, ptr, len);
    console.log(String.fromCharCode.apply(null, result));
    barcode_result = String.fromCharCode.apply(null, result);
    
    hideCamera();
};

// check devices
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
}

// stackoverflow: http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata/5100158
const dataURItoBlob = (dataURI) => {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString = null;

    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {
        type: mimeString
    });
};

// scan barcode
const scanBarcode = () => {
    if (scannerPaused)
        return;

    if (scanner == null) {
        // Barcode Reader is not ready!
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
            image = scanner._resize(imageWidth, imageHeight);

        console.time("decode barcode");

        for (let i = 0, j = 0; i < idd.length; i += 4, j++) {
            scanner.HEAPU8[image + j] = idd[i];
        }

        const err = scanner._decode_any(decodePtr);

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

    navigator.mediaDevices.getUserMedia(constraints).
    then(gotStream).catch(handleError);
};

const gotStream = (stream) => {
    window.stream = stream; // make stream available to console
    videoElement.srcObject = stream;
};

const handleError = (error) => {
  console.log('Error: ', error);
};

/* immediate function calls */
tick();

if (browserRedirect() == 'pc') {
    isPC = true;
}
else {
    isPC = false;
}

navigator.mediaDevices.enumerateDevices()
  .then(gotDevices).then(getStream).catch(handleError);

videoSelect.onchange = getStream;