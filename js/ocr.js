// ADVANCED MOVIE SUBTITLE OCR

function isolateSubtitle(canvas){

  const src =
  cv.imread(canvas);

  // convert RGBA -> RGB
  const rgb =
  new cv.Mat();

  cv.cvtColor(
    src,
    rgb,
    cv.COLOR_RGBA2RGB
  );

  // white subtitle mask
  const mask =
  new cv.Mat();

  const low =
  new cv.Mat(
    rgb.rows,
    rgb.cols,
    rgb.type(),
    [160,160,160,0]
  );

  const high =
  new cv.Mat(
    rgb.rows,
    rgb.cols,
    rgb.type(),
    [255,255,255,255]
  );

  cv.inRange(
    rgb,
    low,
    high,
    mask
  );

  // morphology remove noise
  const kernel =
  cv.getStructuringElement(
    cv.MORPH_RECT,
    new cv.Size(3,3)
  );

  cv.morphologyEx(
    mask,
    mask,
    cv.MORPH_OPEN,
    kernel
  );

  cv.morphologyEx(
    mask,
    mask,
    cv.MORPH_CLOSE,
    kernel
  );

  // dilate subtitle
  cv.dilate(
    mask,
    mask,
    kernel
  );

  // find subtitle text bounds
  const contours =
  new cv.MatVector();

  const hierarchy =
  new cv.Mat();

  cv.findContours(
    mask,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
  );

  let minX = 99999;
  let minY = 99999;
  let maxX = 0;
  let maxY = 0;

  for(let i=0;i<contours.size();i++){

    const cnt =
    contours.get(i);

    const rect =
    cv.boundingRect(cnt);

    // ignore tiny noise
    if(
      rect.width < 25 ||
      rect.height < 10
    ){
      continue;
    }

    minX =
    Math.min(minX,rect.x);

    minY =
    Math.min(minY,rect.y);

    maxX =
    Math.max(
      maxX,
      rect.x + rect.width
    );

    maxY =
    Math.max(
      maxY,
      rect.y + rect.height
    );

  }

  // fallback
  if(maxX <= minX){

    minX = 0;
    minY = 0;
    maxX = mask.cols;
    maxY = mask.rows;

  }

  // crop only subtitle line
  const rect =
  new cv.Rect(
    Math.max(0,minX-10),
    Math.max(0,minY-10),
    Math.min(
      mask.cols-minX,
      (maxX-minX)+20
    ),
    Math.min(
      mask.rows-minY,
      (maxY-minY)+20
    )
  );

  const cropped =
  mask.roi(rect);

  // upscale huge
  const resized =
  new cv.Mat();

  cv.resize(
    cropped,
    resized,
    new cv.Size(
      cropped.cols * 6,
      cropped.rows * 6
    ),
    0,
    0,
    cv.INTER_CUBIC
  );

  // invert
  const inverted =
  new cv.Mat();

  cv.bitwise_not(
    resized,
    inverted
  );

  cv.imshow(
    'cleanCanvas',
    inverted
  );

  src.delete();
  rgb.delete();
  mask.delete();
  low.delete();
  high.delete();
  kernel.delete();
  contours.delete();
  hierarchy.delete();
  cropped.delete();
  resized.delete();
  inverted.delete();

}

async function testOCR(){

  if(!video.videoWidth){

    alert(
      'Video belum dimuat'
    );

    return;

  }

  document
  .getElementById(
    'ocrPreview'
  )
  .innerHTML =
  'Processing OCR...';

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
  Math.floor(
    cropXPct/100*vW
  );

  const cY =
  Math.floor(
    cropYPct/100*vH
  );

  const cW =
  Math.floor(
    cropWPct/100*vW
  );

  const cH =
  Math.floor(
    cropHPct/100*vH
  );

  const crop =
  document.createElement('canvas');

  crop.width = cW;
  crop.height = cH;

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

  await worker.setParameters({

    tessedit_pageseg_mode: '7',

    preserve_interword_spaces: '1'

  });

  const result =
  await worker.recognize(
    document.getElementById(
      'cleanCanvas'
    )
  );

  await worker.terminate();

  let text =
  result.data.text || '';

  text = text

  .replace(/\n/g,' ')

  .replace(/\s+/g,' ')

  .replace(/[|]/g,'I')

  .replace(/[“”]/g,'"')

  .replace(/[‘’]/g,"'")

  .trim();

  document
  .getElementById(
    'ocrPreview'
  )
  .innerHTML =
  text;

  document
  .getElementById(
    'status'
  )
  .innerHTML =
  `
  OCR Confidence:
  ${Math.round(result.data.confidence)}%
  `;

  }
