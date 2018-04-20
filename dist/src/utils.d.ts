import { ResizeOptions } from './interfaces';
export declare function createVideo(url: string, cb: (i: HTMLVideoElement) => void): void;
export declare function resizeVideo(origVideo: HTMLVideoElement, {resizeHeight, resizeWidth, resizeQuality, resizeType, resizeMode}?: ResizeOptions): string;
