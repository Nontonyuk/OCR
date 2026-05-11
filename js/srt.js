function srtTime(sec){

  const h =
  Math.floor(sec/3600);

  const m =
  Math.floor((sec%3600)/60);

  const s =
  Math.floor(sec%60);

  const ms =
  Math.floor(
    (sec-Math.floor(sec))*1000
  );

  return `${

    String(h).padStart(2,'0')

  }:${
    String(m).padStart(2,'0')
  }:${
    String(s).padStart(2,'0')
  },${
    String(ms).padStart(3,'0')
  }`;

}

function buildSRT(){

  let srt='';

  subtitles.forEach((sub,index)=>{

    srt +=
`${index+1}
${srtTime(sub.start)} --> ${srtTime(sub.end)}
${sub.text}

`;

  });

  return srt;

}

function downloadSRT(){

  const blob =
  new Blob(
    [buildSRT()],
    {type:'text/plain'}
  );

  const a =
  document.createElement('a');

  a.href =
  URL.createObjectURL(blob);

  a.download =
  'subtitle.srt';

  a.click();

}
