/* Shared SVG illustrations — consistent animal characters across all games.
   Flat design, high contrast, thick outlines, visually distinct at small sizes.
   Usage: window.ILLUSTRATIONS.svg('cow') → SVG string
          window.ILLUSTRATIONS.emoji('cow') → emoji fallback
          window.ILLUSTRATIONS.list() → ['cat','dog',...] */
(function(){
  const S = 100; // viewBox size

  const animals = {
    cat: {emoji:'🐱', bg:'#FFD1DC', body:'#F4A261', accent:'#E76F51'},
    dog: {emoji:'🐶', bg:'#FFE7A3', body:'#B08968', accent:'#7F5539'},
    fox: {emoji:'🦊', bg:'#FFE0C2', body:'#E76F51', accent:'#D62828'},
    cow: {emoji:'🐮', bg:'#E4E4E4', body:'#F5F5F5', accent:'#2B2D42'},
    pig: {emoji:'🐷', bg:'#FFDCE5', body:'#FFB4C8', accent:'#FF6F91'},
    duck: {emoji:'🦆', bg:'#FFF6C9', body:'#FFD23F', accent:'#F4A261'},
    horse: {emoji:'🐴', bg:'#EAD9C8', body:'#B08968', accent:'#7F5539'},
    chicken: {emoji:'🐔', bg:'#FFF0D6', body:'#F5F5F5', accent:'#E76F51'},
    lion: {emoji:'🦁', bg:'#FFDD9E', body:'#F4A261', accent:'#D62828'},
    elephant: {emoji:'🐘', bg:'#D9E6F2', body:'#A8DADC', accent:'#457B9D'},
    frog: {emoji:'🐸', bg:'#D8F5D0', body:'#67C971', accent:'#2D6A4F'},
    sheep: {emoji:'🐑', bg:'#F1F1F1', body:'#F5F5F5', accent:'#6C757D'},
  };

  function svg(name){
    const a = animals[name];
    if(!a) return '';
    const b = a.body, ac = a.accent, bg = a.bg;
    const eyes = '<circle cx="38" cy="42" r="5" fill="#2B2D42"/><circle cx="62" cy="42" r="5" fill="#2B2D42"/>';
    const shine = '<circle cx="40" cy="40" r="1.5" fill="#fff"/><circle cx="64" cy="40" r="1.5" fill="#fff"/>';

    const bodies = {
      cat: `<ellipse cx="50" cy="60" rx="22" ry="18" fill="${b}"/><polygon points="30,48 36,32 42,46" fill="${b}"/><polygon points="58,46 64,32 70,48" fill="${b}"/><polygon points="32,46 36,36 40,45" fill="${ac}"/><polygon points="60,45 64,36 68,46" fill="${ac}"/><path d="M42 68 Q50 74 58 68" stroke="${ac}" stroke-width="2" fill="none"/><ellipse cx="50" cy="58" rx="4" ry="3" fill="${ac}"/>`,
      dog: `<ellipse cx="50" cy="60" rx="22" ry="18" fill="${b}"/><ellipse cx="32" cy="48" rx="8" ry="12" fill="${ac}"/><ellipse cx="68" cy="48" rx="8" ry="12" fill="${ac}"/><ellipse cx="50" cy="62" rx="6" ry="4" fill="${ac}"/><path d="M44 70 Q50 76 56 70" stroke="${ac}" stroke-width="2" fill="none"/>`,
      fox: `<ellipse cx="50" cy="60" rx="20" ry="16" fill="${b}"/><polygon points="32,46 38,28 44,44" fill="${b}"/><polygon points="56,44 62,28 68,46" fill="${b}"/><polygon points="34,44 38,34 42,43" fill="#fff"/><polygon points="58,43 62,34 66,44" fill="#fff"/><ellipse cx="50" cy="64" rx="5" ry="3" fill="${ac}"/>`,
      cow: `<ellipse cx="50" cy="58" rx="24" ry="20" fill="${b}"/><ellipse cx="38" cy="50" rx="8" ry="6" fill="${ac}"/><ellipse cx="62" cy="56" rx="6" ry="5" fill="${ac}"/><ellipse cx="50" cy="68" rx="10" ry="6" fill="${ac}"/><circle cx="46" cy="68" r="2" fill="#2B2D42"/><circle cx="54" cy="68" r="2" fill="#2B2D42"/>`,
      pig: `<ellipse cx="50" cy="58" rx="24" ry="20" fill="${b}"/><ellipse cx="50" cy="66" rx="8" ry="5" fill="${ac}"/><circle cx="47" cy="66" r="1.5" fill="#2B2D42"/><circle cx="53" cy="66" r="1.5" fill="#2B2D42"/><polygon points="36,48 42,38 44,48" fill="${ac}"/><polygon points="56,48 58,38 64,48" fill="${ac}"/>`,
      duck: `<ellipse cx="50" cy="58" rx="22" ry="18" fill="${b}"/><ellipse cx="50" cy="66" rx="10" ry="4" fill="${ac}"/><circle cx="46" cy="66" r="1.5" fill="#2B2D42"/><circle cx="54" cy="66" r="1.5" fill="#2B2D42"/>`,
      horse: `<ellipse cx="50" cy="58" rx="22" ry="18" fill="${b}"/><rect x="46" y="28" width="8" height="16" rx="3" fill="${ac}"/><ellipse cx="50" cy="64" rx="6" ry="4" fill="${ac}"/><path d="M44 70 Q50 74 56 70" stroke="${ac}" stroke-width="2" fill="none"/>`,
      chicken: `<ellipse cx="50" cy="58" rx="20" ry="18" fill="${b}"/><path d="M50 38 Q44 30 50 26 Q56 30 50 38" fill="${ac}"/><ellipse cx="50" cy="66" rx="6" ry="3" fill="${ac}"/><circle cx="47" cy="66" r="1" fill="#2B2D42"/><circle cx="53" cy="66" r="1" fill="#2B2D42"/>`,
      lion: `<circle cx="50" cy="50" r="26" fill="${ac}"/><circle cx="50" cy="54" r="18" fill="${b}"/><ellipse cx="50" cy="62" rx="5" ry="3" fill="${ac}"/>`,
      elephant: `<ellipse cx="50" cy="56" rx="26" ry="22" fill="${b}"/><ellipse cx="30" cy="50" rx="10" ry="12" fill="${ac}"/><ellipse cx="70" cy="50" rx="10" ry="12" fill="${ac}"/><path d="M50 60 Q50 78 44 82" stroke="${b}" stroke-width="6" fill="none"/>`,
      frog: `<ellipse cx="50" cy="58" rx="24" ry="18" fill="${b}"/><circle cx="38" cy="44" r="8" fill="${b}"/><circle cx="62" cy="44" r="8" fill="${b}"/><circle cx="38" cy="44" r="4" fill="#2B2D42"/><circle cx="62" cy="44" r="4" fill="#2B2D42"/><path d="M40 66 Q50 74 60 66" stroke="${ac}" stroke-width="2" fill="none"/>`,
      sheep: `<circle cx="50" cy="50" r="24" fill="${b}"/><circle cx="38" cy="42" r="8" fill="${b}"/><circle cx="62" cy="42" r="8" fill="${b}"/><circle cx="50" cy="38" r="8" fill="${b}"/><ellipse cx="50" cy="62" rx="6" ry="4" fill="${ac}"/>`,
    };

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="100%" height="100%">`
      + `<rect width="${S}" height="${S}" rx="12" fill="${bg}"/>`
      + (bodies[name] || '')
      + eyes + shine
      + `</svg>`;
  }

  function emoji(name){ return animals[name] ? animals[name].emoji : ''; }
  function list(){ return Object.keys(animals); }

  if(typeof window !== 'undefined') window.ILLUSTRATIONS = {svg, emoji, list};
  if(typeof module !== 'undefined') module.exports = {svg, emoji, list};
})();
