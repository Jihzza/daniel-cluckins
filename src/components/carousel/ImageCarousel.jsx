// src/components/carousel/ImageCarousel.jsx

import React from 'react';
import BaseCarousel from './BaseCarousel';

// Image Import
// Twitter
import Twitter2 from '../../assets/Twitter/Twitter2.png';
import Twitter4 from '../../assets/Twitter/Twitter4.png';
import Twitter5 from '../../assets/Twitter/Twitter5.png';
import Twitter6 from '../../assets/Twitter/Twitter6.png';
import Twitter7 from '../../assets/Twitter/Twitter7.png';
import Twitter8 from '../../assets/Twitter/Twitter8.png';
import Twitter9 from '../../assets/Twitter/Twitter9.png';
import Twitter10 from '../../assets/Twitter/Twitter10.png';
import Twitter11 from '../../assets/Twitter/Twitter11.png';
import Twitter12 from '../../assets/Twitter/Twitter12.png';
import Twitter13 from '../../assets/Twitter/Twitter13.png';
import Twitter14 from '../../assets/Twitter/Twitter14.png';
import Twitter15 from '../../assets/Twitter/Twitter15.png';
import Twitter16 from '../../assets/Twitter/Twitter16.png';
import Twitter17 from '../../assets/Twitter/Twitter17.png';
import Twitter18 from '../../assets/Twitter/Twitter18.png';
import Twitter19 from '../../assets/Twitter/Twitter19.png';
import Twitter20 from '../../assets/Twitter/Twitter20.png';
import Twitter21 from '../../assets/Twitter/Twitter21.png';
import Twitter24 from '../../assets/Twitter/Twitter24.png';
import Twitter25 from '../../assets/Twitter/Twitter25.png';
import Twitter26 from '../../assets/Twitter/Twitter26.png';
import Twitter27 from '../../assets/Twitter/Twitter27.png';
import Twitter28 from '../../assets/Twitter/Twitter28.png';
import Twitter29 from '../../assets/Twitter/Twitter29.png';
import Twitter30 from '../../assets/Twitter/Twitter30.png';
import Twitter31 from '../../assets/Twitter/Twitter31.png';
import Twitter32 from '../../assets/Twitter/Twitter32.png';
import Twitter33 from '../../assets/Twitter/Twitter33.png';
import Twitter34 from '../../assets/Twitter/Twitter34.png';
import Twitter35 from '../../assets/Twitter/Twitter35.png';
import Twitter36 from '../../assets/Twitter/Twitter36.png';
import Twitter37 from '../../assets/Twitter/Twitter37.png';

// Tiktok (folder name is 'Tiktok' in your file)
import Tiktok1 from '../../assets/Tiktok/Tiktok1.png';
import Tiktok2 from '../../assets/Tiktok/Tiktok2.png';
import Tiktok3 from '../../assets/Tiktok/Tiktok3.png';
import Tiktok4 from '../../assets/Tiktok/Tiktok4.png';
import Tiktok5 from '../../assets/Tiktok/Tiktok5.png';
import Tiktok6 from '../../assets/Tiktok/Tiktok6.png';
import Tiktok7 from '../../assets/Tiktok/Tiktok7.png';
import Tiktok8 from '../../assets/Tiktok/Tiktok8.png';
import Tiktok9 from '../../assets/Tiktok/Tiktok9.png';
import Tiktok10 from '../../assets/Tiktok/Tiktok10.png';
import Tiktok11 from '../../assets/Tiktok/Tiktok11.png';
import Tiktok12 from '../../assets/Tiktok/Tiktok12.png';
import Tiktok13 from '../../assets/Tiktok/Tiktok13.png';
import Tiktok14 from '../../assets/Tiktok/Tiktok14.png';
import Tiktok15 from '../../assets/Tiktok/Tiktok15.png';
import Tiktok16 from '../../assets/Tiktok/Tiktok16.png';
import Tiktok17 from '../../assets/Tiktok/Tiktok17.png';
import Tiktok18 from '../../assets/Tiktok/Tiktok18.png';
import Tiktok19 from '../../assets/Tiktok/Tiktok19.png';
import Tiktok20 from '../../assets/Tiktok/Tiktok20.png';

// Keep your posts array using imageSrc + href
const posts = [
  { imageSrc: Twitter2, href: 'https://x.com/galo_portugues/status/1610780921111740424' },
  { imageSrc: Twitter4, href: 'https://x.com/galo_portugues/status/1612540968967741449' },
  { imageSrc: Twitter5, href: 'https://x.com/galo_portugues/status/1612924472088219648' },
  { imageSrc: Twitter6, href: 'https://x.com/galo_portugues/status/1612870732031135759' },
  { imageSrc: Twitter7, href: 'https://x.com/galo_portugues/status/1613169414412668928' },
  { imageSrc: Twitter8, href: 'https://x.com/galo_portugues/status/1613199908579713024' },
  { imageSrc: Twitter9, href: 'https://x.com/galo_portugues/status/1613293969831612457' },
  { imageSrc: Twitter10, href: 'https://x.com/galo_portugues/status/1613259352953221120' },
  { imageSrc: Twitter11, href: 'https://x.com/galo_portugues/status/1613315107605610502' },
  { imageSrc: Twitter12, href: 'https://x.com/galo_portugues/status/1613530446381592578' },
  { imageSrc: Twitter13, href: 'https://x.com/galo_portugues/status/1613600934952865794' },
  { imageSrc: Twitter14, href: 'https://x.com/galo_portugues/status/1613925034225016833' },
  { imageSrc: Twitter15, href: 'https://x.com/galo_portugues/status/1614251694577291266' },
  { imageSrc: Twitter16, href: 'https://x.com/galo_portugues/status/1614346875175424002' },
  { imageSrc: Twitter17, href: 'https://x.com/galo_portugues/status/1614619031134248962' },
  { imageSrc: Twitter18, href: 'https://x.com/galo_portugues/status/1615076490336501782' },
  { imageSrc: Twitter19, href: 'https://x.com/galo_portugues/status/1615088749943160848' },
  { imageSrc: Twitter20, href: 'https://x.com/galo_portugues/status/1614669875586437122' },
  { imageSrc: Twitter21, href: 'https://x.com/galo_portugues/status/1616209812357877763' },
  { imageSrc: Twitter24, href: 'https://x.com/galo_portugues/status/1623111519088136197' },
  { imageSrc: Twitter25, href: 'https://x.com/galo_portugues/status/1623419940643434496' },
  { imageSrc: Twitter26, href: 'https://x.com/galo_portugues/status/1627804993184010241' },
  { imageSrc: Twitter27, href: 'https://x.com/galo_portugues/status/1627653957291069441' },
  { imageSrc: Twitter28, href: 'https://x.com/galo_portugues/status/1627812951112445954' },
  { imageSrc: Twitter29, href: 'https://x.com/galo_portugues/status/1629456908590481410' },
  { imageSrc: Twitter30, href: 'https://x.com/galo_portugues/status/1628031737094631424' },
  { imageSrc: Twitter31, href: 'https://x.com/galo_portugues/status/1629859496607531014' },
  { imageSrc: Twitter32, href: 'https://x.com/galo_portugues/status/1628096895200493568' },
  { imageSrc: Twitter33, href: 'https://x.com/galo_portugues/status/1633180612642103298' },
  { imageSrc: Twitter34, href: 'https://x.com/galo_portugues/status/1740650460871324145' },
  { imageSrc: Twitter35, href: 'https://x.com/galo_portugues/status/1771953368732205323' },
  { imageSrc: Twitter36, href: 'https://x.com/galo_portugues/status/1629883089626320897' },
  { imageSrc: Twitter37, href: 'https://x.com/galo_portugues/status/1774914680693084319' },

  { imageSrc: Tiktok1, href: 'https://www.tiktok.com/@galo_portugues/video/7069126152278854918' },
  { imageSrc: Tiktok2, href: 'https://www.tiktok.com/@galo_portugues/video/7344661288200457505' },
  { imageSrc: Tiktok3, href: 'https://www.tiktok.com/@galo_portugues/video/7149949788912504069' },
  { imageSrc: Tiktok4, href: 'https://www.tiktok.com/@galo_portugues/video/7319997405875719456' },
  { imageSrc: Tiktok5, href: 'https://www.tiktok.com/@galo_portugues/video/7069121685437566213' },
  { imageSrc: Tiktok6, href: 'https://www.tiktok.com/@galo_portugues/video/7172986842680233222' },
  { imageSrc: Tiktok7, href: 'https://www.tiktok.com/@galo_portugues/video/7086223291626622214' },
  { imageSrc: Tiktok8, href: 'https://www.tiktok.com/@galo_portugues/video/7188941851527744774' },
  { imageSrc: Tiktok9, href: 'https://www.tiktok.com/@galo_portugues/video/7172852623224130821' },
  { imageSrc: Tiktok10, href: 'https://www.tiktok.com/@galo_portugues/video/7152008606173515014' },
  { imageSrc: Tiktok11, href: 'https://www.tiktok.com/@galo_portugues/video/7346480566998469920' },
  { imageSrc: Tiktok12, href: 'https://www.tiktok.com/@galo_portugues/video/7172269860284550405' },
  { imageSrc: Tiktok13, href: 'https://www.tiktok.com/@galo_portugues/video/7172247525540334854' },
  { imageSrc: Tiktok14, href: 'https://www.tiktok.com/@galo_portugues/video/7172250969269472517' },
  { imageSrc: Tiktok15, href: 'https://www.tiktok.com/@galo_portugues/video/7189354490376523013' },
  { imageSrc: Tiktok16, href: 'https://www.tiktok.com/@galo_portugues/video/7158439224776117510' },
  { imageSrc: Tiktok17, href: 'https://www.tiktok.com/@galo_portugues/video/7202375791575829766' },
  { imageSrc: Tiktok18, href: 'https://www.tiktok.com/@galo_portugues/video/7150561631989222661' },
  { imageSrc: Tiktok19, href: 'https://www.tiktok.com/@galo_portugues/video/7188496959748001030' },
  { imageSrc: Tiktok20, href: 'https://www.tiktok.com/@galo_portugues/video/7188901762542128389' },
];

export default function ImageCarousel() {
  const swiperConfig = {
        // normal, non-3D carousel
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        spaceBetween: 40,
        coverflowEffect: {
            rotate: 0,
            stretch: 0,
            modifier: 2.5,
            slideShadows: false,
        },
      };

  const renderPostSlide = (item, index) => (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full h-full"
      onClick={(e) => e.stopPropagation()}
      aria-label={`Open social post ${index + 1}`}
    >
      <img src={item.imageSrc} alt={`Other win ${index + 1}`} className="rounded-xl object-cover w-full h-auto" loading="lazy" />
    </a>
  );

  return (
    <div className="relative">
      <BaseCarousel
        items={posts}
        renderItem={renderPostSlide}
        swiperConfig={swiperConfig}
        containerClassName="w-full image-swiper"
        slideClassName="swiper-slide-custom"
      />
    </div>
  );
}
