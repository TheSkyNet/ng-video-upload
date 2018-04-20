import {ResizeOptions} from './interfaces';

export function createVideo(url: string, cb: (i: HTMLVideoElement) => void) {
  let video = new HTMLVideoElement();
  video.onload = function () {
    cb(video);
  };
  video.src = url;
}

const resizeAreaId = 'videoupload-resize-area';

function getResizeArea() {
  let resizeArea = document.getElementById(resizeAreaId);
  if (!resizeArea) {
    resizeArea = document.createElement('canvas');
    resizeArea.id = resizeAreaId;
    resizeArea.style.display = 'none';
    document.body.appendChild(resizeArea);
  }

  return <HTMLCanvasElement>resizeArea;
}

export function resizeVideo(origVideo: HTMLVideoElement, {
  resizeHeight,
  resizeWidth,
  resizeQuality = 0.7,
  resizeType = 'video/jpeg',
  resizeMode = 'fill'
}: ResizeOptions = {}) {

  let canvas = getResizeArea();

  let height = origVideo.height;
  let width = origVideo.width;
  let offsetX = 0;
  let offsetY = 0;

  if (resizeMode === 'fill') {
    // calculate the width and height, constraining the proportions
    if (width / height > resizeWidth / resizeHeight) {
      width = Math.round(height * resizeWidth / resizeHeight);
    } else {
      height = Math.round(width * resizeHeight / resizeWidth);
    }

    canvas.width = resizeWidth <= width ? resizeWidth : width;
    canvas.height = resizeHeight <= height ? resizeHeight : height;

    offsetX = origVideo.width / 2 - width / 2;
    offsetY = origVideo.height / 2 - height / 2;

    //draw video on canvas
    const ctx = canvas.getContext("2d");
    ctx.drawImage(origVideo, offsetX, offsetY, width, height, 0, 0, canvas.width, canvas.height);
  } else if (resizeMode === 'fit') {
      // calculate the width and height, constraining the proportions
      if (width > height) {
          if (width > resizeWidth) {
              height = Math.round(height *= resizeWidth / width);
              width = resizeWidth;
          }
      } else {
          if (height > resizeHeight) {
              width = Math.round(width *= resizeHeight / height);
              height = resizeHeight;
          }
      }

      canvas.width = width;
      canvas.height = height;

      //draw video on canvas
      const ctx = canvas.getContext("2d");
      ctx.drawImage(origVideo, 0, 0, width, height);
  } else {
    throw new Error('Unknown resizeMode: ' + resizeMode);
  }

  // get the data from canvas as 70% jpg (or specified type).
  return canvas.toDataURL(resizeType, resizeQuality);
}


