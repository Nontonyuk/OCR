// OCR + CLEAN SUBTITLE PROCESSING

function isolateSubtitle(canvas){

  // baca canvas
  const src = cv.imread(canvas);

  // grayscale
  const gray = new cv.Mat();

  cv.cvtColor(
    src,
    gray,
    cv.COLOR_RGBA2GRAY
  );

  // blur kecil agar noise berkurang
  const blur = new cv.Mat();

  cv.GaussianBlur(
    gray,
    blur,
    new cv.Size(3,3),
    0
  );

  // threshold khusus subtitle putih
  const thresh = new cv.Mat();

  cv.threshold(
    blur,
    thresh,
    180,
    255,
    cv.THRESH_BINARY
  );

  // kernel noise cleaner
  const kernel =
  cv.Mat.ones(
    2,
    2,
    cv.CV_8U
  );

  // hapus noise kecil
  cv.morphologyEx(
    thresh,
    thresh,
    cv.MORPH_OPEN,
    kernel
  );

  // tebalkan text
  cv.dilate(
    thresh,
    thresh,
    kernel
  );

  // resize supaya OCR lebih akurat
  const resized =
  new cv.Mat();

  cv.resize(
    thresh,
    resized,
    new cv.Size(
      thresh.cols * 4,
      thresh.rows * 4
    ),
    0,
    0,
    cv.INTER_CUBIC
  );

  // invert:
  // text hitam
  // background putih
  const inverted =
  new cv.Mat();

  cv.bitwise_not(
    resized,
    inverted
  );

  // tampilkan hasil clean
  cv.imshow(
    'cleanCanvas',
    inverted
  );

  // cleanup memory
  src.delete();
  gray.delete();
  blur.delete();
  thresh.delete();
  kernel.delete();
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

  // canvas frame video
  const canvas =
  document.createElement('canvas');

  canvas.width =
  video.videoWidth;

  canvas.height =
  video.videoHeight;

  const ctx =
  canvas.getContext('2d');

  ctx.drawImage(
    video,
    0,
    0
  );

  // crop position
  const vW =
  video.videoWidth;

  const vH =
  video.videoHeight;

  const cX =
  Math.floor(
    cropXPct / 100 * vW
  );

  const cY =
  Math.floor(
    cropYPct / 100 * vH
  );

  const cW =
  Math.floor(
    cropWPct / 100 * vW
  );

  const cH =
  Math.floor(
    cropHPct / 100 * vH
  );

  // crop subtitle area
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

  // clean subtitle
  isolateSubtitle(crop);

  // loading text
  document
  .getElementById(
    'ocrPreview'
  )
  .innerHTML =
  'Processing OCR...';

  document
  .getElementById(
    'status'
  )
  .innerHTML =
  'Initializing OCR...';

  try{

    // create OCR worker
    const worker =
    await Tesseract.createWorker(
      'ind+eng'
    );

    // OCR recognize
    const result =
    await worker.recognize(
      document.getElementById(
        'cleanCanvas'
      ),
      {
        tessedit_pageseg_mode: 7
      }
    );

    await worker.terminate();

    // clean text result
    let text =
    result.data.text || '';

    text = text

    .replace(/\n/g,' ')

    .replace(/\s+/g,' ')

    .replace(/[|]/g,'I')

    .replace(/[“”]/g,'"')

    .replace(/[‘’]/g,"'")

    .trim();

    // tampilkan hasil
    document
    .getElementById(
      'ocrPreview'
    )
    .innerHTML =
    text || '(tidak ada subtitle)';

    // confidence
    document
    .getElementById(
      'status'
    )
    .innerHTML =
    `
    OCR Confidence:
    ${Math.round(result.data.confidence)}%
    `;

  }catch(err){

    console.error(err);

    document
    .getElementById(
      'ocrPreview'
    )
    .innerHTML =
    'OCR ERROR';

    document
    .getElementById(
      'status'
    )
    .innerHTML =
    err.message;

  }

  }
