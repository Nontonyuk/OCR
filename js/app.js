let cropXPct = 15;
let cropYPct = 76;
let cropWPct = 70;
let cropHPct = 14;

const video =
document.getElementById('video');

document
.getElementById('fileInput')
.addEventListener('change',e=>{

  const file =
  e.target.files[0];

  if(!file) return;

  video.src =
  URL.createObjectURL(file);

  document
  .getElementById('videoWrap')
  .style.display='block';

  video.onloadedmetadata=()=>{

    renderCrop();
    initCropDrag();

  };

});

function renderCrop(){

  const stage =
  document.getElementById('videoStage');

  const crop =
  document.getElementById('cropBox');

  const w =
  stage.clientWidth;

  const h =
  stage.clientHeight;

  const left =
  cropXPct/100*w;

  const top =
  cropYPct/100*h;

  const width =
  cropWPct/100*w;

  const height =
  cropHPct/100*h;

  crop.style.left=left+'px';
  crop.style.top=top+'px';
  crop.style.width=width+'px';
  crop.style.height=height+'px';

  document.getElementById('darkTop').style.cssText=
  `
  left:0;
  top:0;
  width:100%;
  height:${top}px;
  `;

  document.getElementById('darkBottom').style.cssText=
  `
  left:0;
  top:${top+height}px;
  width:100%;
  height:${h-(top+height)}px;
  `;

  document.getElementById('darkLeft').style.cssText=
  `
  left:0;
  top:${top}px;
  width:${left}px;
  height:${height}px;
  `;

  document.getElementById('darkRight').style.cssText=
  `
  left:${left+width}px;
  top:${top}px;
  width:${w-(left+width)}px;
  height:${height}px;
  `;

}

function initCropDrag(){

  const stage =
  document.getElementById('videoStage');

  const handles={

    top:
    document.getElementById('topHandle'),

    bottom:
    document.getElementById('bottomHandle'),

    left:
    document.getElementById('leftHandle'),

    right:
    document.getElementById('rightHandle'),

    move:
    document.getElementById('moveArea')

  };

  function bind(el,type){

    let startX,startY;
    let sx,sy,sw,sh;

    function down(e){

      e.preventDefault();

      startX =
      e.touches?.[0]?.clientX ||
      e.clientX;

      startY =
      e.touches?.[0]?.clientY ||
      e.clientY;

      sx=cropXPct;
      sy=cropYPct;
      sw=cropWPct;
      sh=cropHPct;

      window.addEventListener(
        'mousemove',
        move
      );

      window.addEventListener(
        'mouseup',
        up
      );

      window.addEventListener(
        'touchmove',
        move,
        {passive:false}
      );

      window.addEventListener(
        'touchend',
        up
      );

    }

    function move(e){

      e.preventDefault();

      const x =
      e.touches?.[0]?.clientX ||
      e.clientX;

      const y =
      e.touches?.[0]?.clientY ||
      e.clientY;

      const dx =
      (x-startX)/
      stage.clientWidth*100;

      const dy =
      (y-startY)/
      stage.clientHeight*100;

      if(type==='move'){

        cropXPct=sx+dx;
        cropYPct=sy+dy;

      }

      if(type==='top'){

        cropYPct=sy+dy;
        cropHPct=sh-dy;

      }

      if(type==='bottom'){

        cropHPct=sh+dy;

      }

      if(type==='left'){

        cropXPct=sx+dx;
        cropWPct=sw-dx;

      }

      if(type==='right'){

        cropWPct=sw+dx;

      }

      renderCrop();

    }

    function up(){

      window.removeEventListener(
        'mousemove',
        move
      );

      window.removeEventListener(
        'mouseup',
        up
      );

      window.removeEventListener(
        'touchmove',
        move
      );

      window.removeEventListener(
        'touchend',
        up
      );

    }

    el.addEventListener(
      'mousedown',
      down
    );

    el.addEventListener(
      'touchstart',
      down,
      {passive:false}
    );

  }

  bind(handles.top,'top');
  bind(handles.bottom,'bottom');
  bind(handles.left,'left');
  bind(handles.right,'right');
  bind(handles.move,'move');

}

function presetBottom(){

  cropXPct=15;
  cropYPct=78;
  cropWPct=70;
  cropHPct=14;

  renderCrop();

}

function presetMiddle(){

  cropXPct=15;
  cropYPct=42;
  cropWPct=70;
  cropHPct=14;

  renderCrop();

}

function presetTop(){

  cropXPct=15;
  cropYPct=8;
  cropWPct=70;
  cropHPct=14;

  renderCrop();

        }
