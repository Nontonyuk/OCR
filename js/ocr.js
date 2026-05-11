function isolateSubtitle(canvas){

  const src =
  cv.imread(canvas);

  const gray =
  new cv.Mat();

  cv.cvtColor(
    src,
    gray,
    cv.COLOR_RGBA2GRAY
  );

  const blur =
  new cv.Mat();

  cv.GaussianBlur(
    gray,
    blur,
    new cv.Size(3,3),
    0
  );

  cv.equalizeHist(
    blur,
    blur
  );

  const thresh =
  new cv.Mat();

  cv.adaptiveThreshold(
    blur,
    thresh,
    255,
    cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv.THRESH_BINARY,
    11,
    2
  );

  cv.imshow(
    'cleanCanvas',
    thresh
  );

  src.delete();
  gray.delete();
  blur.delete();
  thresh.delete();

}

async function testOCR(){

  const canvas =
  document.createElement('canvas');

  canvas.width =
  video.videoWidth;

  canvas.height =
  video.videoHeight;

  const ctx =
  canvas.getContext('2d');

  ctx.drawImage(video,0,0);

  const vW =
  video.videoWidth;

  const vH =
  video.videoHeight;

  const cX =
  Math.floor(cropXPct/100*vW);

  const cY =
  Math.floor(cropYPct/100*vH);

  const cW =
  Math.floor(cropWPct/100*vW);

  const cH =
  Math.floor(cropHPct/100*vH);

  const crop =
  document.createElement('canvas');

  crop.width=cW;
  crop.height=cH;

  const cc =
  crop.getContext('2d');

  cc.drawImage(
    canvas,
    cX,
    cY,
    cW,
    cH,
    0,
    0,
    cW,
    cH
  );

  isolateSubtitle(crop);

  const worker =
  await Tesseract.createWorker(
    'ind+eng'
  );

  const result =
  await worker.recognize(
    document.getElementById('cleanCanvas')
  );

  await worker.terminate();

  document
  .getElementById('ocrPreview')
  .innerHTML =
  result.data.text;

}
