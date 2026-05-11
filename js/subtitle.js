let subtitles = [];

let prevSubtitleFrame = null;

let currentSubtitle = '';

let subtitleStart = 0;

function subtitleDifference(a,b){

  if(!a || !b)
    return 999;

  let diff = 0;

  for(let i=0;i<a.length;i+=4){

    diff += Math.abs(a[i]-b[i]);

  }

  return diff/(a.length/4);

}

function similarity(a,b){

  a=a.toLowerCase();
  b=b.toLowerCase();

  let same=0;

  for(
    let i=0;
    i<Math.min(a.length,b.length);
    i++
  ){

    if(a[i]===b[i]){
      same++;
    }

  }

  return same/
  Math.max(a.length,b.length);

}

async function startSubtitleScan(){

  subtitles=[];

  const worker =
  await Tesseract.createWorker(
    'ind+eng'
  );

  const duration =
  video.duration;

  let currentTime=0;

  while(currentTime<duration){

    document
    .getElementById(
      'scanProgress'
    )
    .value =
    (currentTime/duration)*100;

    video.currentTime =
    currentTime;

    await new Promise(
      r=>video.onseeked=r
    );

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

    const result =
    await worker.recognize(
      document.getElementById(
        'cleanCanvas'
      )
    );

    const text =
    result.data.text.trim();

    if(
      text &&
      similarity(
        currentSubtitle,
        text
      ) < 0.8
    ){

      if(currentSubtitle){

        subtitles.push({

          start:
          subtitleStart,

          end:
          currentTime,

          text:
          currentSubtitle

        });

      }

      currentSubtitle=text;

      subtitleStart=currentTime;

      document
      .getElementById(
        'ocrPreview'
      )
      .innerHTML=text;

    }

    currentTime += 1;

  }

  await worker.terminate();

  document
  .getElementById(
    'srtPreview'
  )
  .value =
  buildSRT();

    }
