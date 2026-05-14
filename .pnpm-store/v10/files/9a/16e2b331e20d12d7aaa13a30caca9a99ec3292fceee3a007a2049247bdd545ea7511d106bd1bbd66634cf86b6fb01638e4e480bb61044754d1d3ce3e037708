/*!
Copyright (c) 2023 Paul Miller (paulmillr.com)
The library paulmillr-qr is dual-licensed under the Apache 2.0 OR MIT license.
You can select a license of your choice.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/**
 * Optional DOM related utilities. Some utilities, useful to decode QR from camera:
 * - draw overlay: helps user to position QR code on camera
 * - draw bitmap: useful for debugging (what decoder sees)
 * - draw result: show scanned QR code
 * The code is fragile: it is easy to make subtle errors, which will break decoding.
 * @module
 */
export declare const getSize: (elm: HTMLElement) => {
    width: number;
    height: number;
};
export type QRCanvasOpts = {
    resultBlockSize: number;
    overlayMainColor: string;
    overlayFinderColor: string;
    overlaySideColor: string;
    overlayTimeout: number;
    cropToSquare: boolean;
    textDecoder?: (bytes: Uint8Array) => string;
};
export type QRCanvasElements = {
    overlay?: HTMLCanvasElement;
    bitmap?: HTMLCanvasElement;
    resultQR?: HTMLCanvasElement;
};
/**
 * Handles canvases for QR code decoding
 */
export declare class QRCanvas {
    private opts;
    private lastDetect;
    private main;
    private overlay?;
    private bitmap?;
    private resultQR?;
    constructor({ overlay, bitmap, resultQR }?: QRCanvasElements, opts?: Partial<QRCanvasOpts>);
    private setSize;
    private drawBitmap;
    private drawResultQr;
    private drawOverlay;
    drawImage(image: CanvasImageSource, height: number, width: number): string | undefined;
    clear(): void;
}
declare class QRCamera {
    private stream;
    private player;
    constructor(stream: MediaStream, player: HTMLVideoElement);
    private setStream;
    /**
     * Returns list of cameras
     * NOTE: available only after first getUserMedia request, so cannot be additional method
     */
    listDevices(): Promise<{
        deviceId: string;
        label: string;
    }[]>;
    /**
     * Change stream to different camera
     * @param deviceId - devideId from '.listDevices'
     */
    setDevice(deviceId: string): Promise<void>;
    readFrame(canvas: QRCanvas, fullSize?: boolean): string | undefined;
    stop(): void;
}
/**
 * Creates new QRCamera from frontal camera
 * @param player - HTML Video element
 * @example
 * const canvas = new QRCanvas();
 * const camera = frontalCamera();
 * const devices = await camera.listDevices();
 * await camera.setDevice(devices[0].deviceId); // Change camera
 * const res = camera.readFrame(canvas);
 */
export declare function frontalCamera(player: HTMLVideoElement): Promise<QRCamera>;
/**
 * Run callback in a loop with requestAnimationFrame
 * @param cb - callback
 * @example
 * const cancel = frameLoop((ns) => console.log(ns));
 * cancel();
 */
export declare function frameLoop(cb: FrameRequestCallback): () => void;
export declare function svgToPng(svgData: string, width: number, height: number): Promise<string>;
export {};
//# sourceMappingURL=dom.d.ts.map