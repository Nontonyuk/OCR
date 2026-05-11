// GEMINI OCR ENGINE
// js/gemini.js

// ========================================
// GEMINI API KEY
// ========================================

// GANTI DENGAN API KEY GEMINI KAMU

const GEMINI_API_KEY =
'AIzaSyDN6ilZFs8c6aYXvoDJC03OxjD88RI3TKs';


// ========================================
// GEMINI MODEL
// ========================================

const GEMINI_MODEL =
'gemini-1.5-flash';


// ========================================
// CANVAS → BASE64
// ========================================

function canvasToBase64(canvas){

  return canvas
  .toDataURL('image/png')
  .split(',')[1];

}


// ========================================
// CLEAN SUBTITLE TEXT
// ========================================

function cleanGeminiText(text){

  if(!text) return '';

  return text

  // remove markdown
  .replace(/```/g,'')

  // remove quote
  .replace(/^["']|["']$/g,'')

  // remove line duplicate
  .replace(/\n+/g,' ')

  // normalize spaces
  .replace(/\s+/g,' ')

  // remove weird chars
  .replace(/[|]/g,'I')

  .trim();

}


// ========================================
// GEMINI OCR
// ========================================

async function geminiOCR(canvas){

  try{

    const base64 =
    canvasToBase64(canvas);

    const prompt =
`
Bacalah subtitle bahasa Indonesia
pada gambar ini.

ATURAN:
- hanya tulis teks subtitle
- jangan jelaskan gambar
- jangan tambah komentar
- jangan tambah tanda kutip
- jika tidak ada subtitle,
  balas kosong
- perbaiki typo OCR jika jelas
`;

    const response =
    await fetch(

      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,

      {

        method:'POST',

        headers:{
          'Content-Type':'application/json'
        },

        body:JSON.stringify({

          contents:[

            {

              parts:[

                {
                  text:prompt
                },

                {

                  inline_data:{

                    mime_type:'image/png',

                    data:base64

                  }

                }

              ]

            }

          ]

        })

      }

    );

    const data =
    await response.json();

    console.log(
      'Gemini response:',
      data
    );

    // ====================================
    // ERROR
    // ====================================

    if(data.error){

      console.error(data.error);

      return '';

    }

    // ====================================
    // GET TEXT
    // ====================================

    const text =
    data
    ?.candidates?.[0]
    ?.content?.parts?.[0]
    ?.text || '';

    return cleanGeminiText(text);

  }catch(err){

    console.error(
      'Gemini OCR Error:',
      err
    );

    return '';

  }

      }
