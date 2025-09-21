// src/components/sections/media/mediaItems.js
// Central source of truth for links + images. Keep copy separate in i18n.
import Media1 from "../../assets/images/CM Logo.png";
import Media2 from "../../assets/images/JN Logo.png";
import Media3 from "../../assets/images/Coutinho.png";


export const mediaItems = [
    {
        id: "cm-tv",
        url: "https://www.cmjornal.pt/cmtv/programas/especiais/investigacao-cm/detalhe/conteudos-sexuais-na-internet-rendem-milhares-de-euros-e-dao-vida-de-luxo-a-utilizadores-veja-agora-na-cmtv-cmtv",
        image: Media1,
        fallbackAlt: "CMTV investigação — especiais" // used if translation key missing
    },
    {
        id: "jn",
        url: "https://x.com/JornalNoticias/status/1642802512435777536",
        image: Media2,
        fallbackAlt: "Jornal de Notícias — publicação em X"
    },
    {
        id: "coutinho",
        url: "https://www.youtube.com/watch?v=0_jkl7e7p5o",
        image: Media3,
        fallbackAlt: "Entrevista no YouTube"
    }
];