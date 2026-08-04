/* Classroom (Учионица) speech asset generator.
   Fetches Serbian (sr) words from Google Translate TTS and writes MP3s to
   game/assets/audio/speech/. Run from repo root:  node resources/tts_generate.js
   Existing files are skipped (idempotent). Each MP3 is validated for an MPEG frame sync.
*/
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'game', 'assets', 'audio', 'speech');

const pairs = [
  // [filename, serbian text] — letter sounds
  // а/у use elongated text (ааа/ууу): single-character TTS renders clip the vowel onset
  ['a','ааа'],['b','б'],['v','в'],['g','г'],['d','д'],['dj','ђ'],['e','е'],
  ['zh','ж'],['z','з'],['i','и'],['j','ј'],['k','к'],['l','л'],['lj','љ'],
  ['m','м'],['n','н'],['nj','њ'],['o','ооо'],['p','п'],['r','р'],['s','с'],
  ['t','т'],['cj','ћ'],['u','ууу'],['f','ф'],['h','х'],['c','ц'],['ch','ч'],
  ['dz','џ'],['sh','ш'],
  // alphabet words
  ['automobil','Аутомобил'],['banana','Банана'],['vuk','Вук'],['gusenica','Гусеница'],
  ['drvo','Дрво'],['djak','Ђак'],['ekran','Екран'],['igla','Игла'],['jabuka','Јабука'],
  ['ljubav','Љубав'],['nos','Нос'],['njuska','Њушка'],['oko','Око'],['riba','Риба'],
  ['torta','Торта'],['cjuran','Ћуран'],['uvo','Уво'],['flamingo','Фламинго'],
  ['helikopter','Хеликоптер'],['cvet','Цвет'],['chamac','Чамац'],['dzemper','Џемпер'],['sesir','Шешир'],
  // colors
  ['crvena','Црвена'],['narandzasta','Наранџаста'],['zuta','Жута'],['zelena','Зелена'],
  ['plava','Плава'],['ljubicasta','Љубичаста'],['roze','Розе'],['braon','Браон'],
  ['siva','Сива'],['bela','Бела'],['crna','Црна'],
  // 3D shapes
  ['lopta','Лопта'],['kocka','Коцка'],['kvadar','Квадар'],['valjak','Ваљак'],['kupa','Купа'],['piramida','Пирамида'],
  // numbers: zero + sentences
  ['nula','Нула'],['jedan_pas','Један пас'],['dva_psa','Два пса'],['tri_macke','Три мачке'],
  ['cetiri_krave','Четири краве'],['pet_slonova','Пет слонова'],['sest_lavova','Шест лавова'],
  ['sedam_pataka','Седам патака'],['osam_konja','Осам коња'],['devet_zaba','Девет жаба'],
  ['deset_svinja','Десет свиња'],
];

if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

function validMp3(buf) {
  return buf.length > 4 && buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0;
}

(async () => {
  let ok = 0, skipped = 0, failed = [];
  for (const [file, text] of pairs) {
    const out = path.join(DIR, file + '.mp3');
    if (fs.existsSync(out)) { skipped++; continue; }
    let buf = null;
    for (let attempt = 1; attempt <= 3 && !buf; attempt++) {
      try {
        const res = await fetch('https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=sr&q=' + encodeURIComponent(text));
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const bytes = Buffer.from(await res.arrayBuffer());
        if (validMp3(bytes)) buf = bytes;
        else throw new Error('not MP3 (' + res.headers.get('content-type') + ')');
      } catch (e) {
        if (attempt === 3) failed.push(file + ' <- ' + text + ' (' + e.message + ')');
        else await sleep(800 * attempt);
      }
    }
    if (buf) { fs.writeFileSync(out, buf); ok++; }
    await sleep(220);
  }
  console.log('generated: ' + ok + ' skipped: ' + skipped + ' failed: ' + failed.length);
  failed.forEach(f => console.log('  FAIL ' + f));
})();
