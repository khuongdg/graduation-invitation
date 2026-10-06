/**
 * Configuration file for Graduation Invitation Website
 * Edit values here to easily customize candidate details, event time, location, Google Sheets integration, etc.
 */

export const siteConfig = {
  // Candidate / Graduate details
  candidate: {
    name: 'DƯƠNG NHỰT KHƯƠNG',
    shortName: 'Khương Dương',
    classYear: 'Class of 2026',
    major: 'Tân cử nhân ngành Kỹ thuật phần mềm',
    school: 'Trường Đại học Tôn Đức Thắng',
    schoolShort: 'TDTU',
    quote: '“Every ending is the beginning of something new.”',
    logoUrl: '/assets/logoTDTU.png',
  },

  // Ceremony Event details
  ceremony: {
    subtitle: 'YOU ARE INVITED TO',
    mainTitlePrefix: 'Graduation',
    mainTitleHighlight: 'Ceremony',
    day: '17',
    monthYear: 'OCTOBER 2026',
    time: '08:00',
    period: 'AM',
    targetDate: '2026-10-17T08:00:00',
    locationHall: 'HALL A',
    locationVenue: 'Ton Duc Thang University',
    subtext: 'Sự hiện diện của bạn là niềm vinh hạnh cho tôi trong ngày trọng đại này!',
    buttonText: 'Xác nhận tham dự',
  },

  // Location / Map section details
  map: {
    title: 'Địa điểm',
    schoolName: 'Trường Đại học Tôn Đức Thắng',
    addressDetail: 'Số 19 đường Nguyễn Hữu Thọ, Phường Tân Hưng, Tp. Hồ Chí Minh',
    address: 'Trường Đại học Tôn Đức Thắng, số 19 đường Nguyễn Hữu Thọ, Phường Tân Hưng, Tp. Hồ Chí Minh',
    image: '/assets/tdtu_mapv1.png',
    googleMapsUrl: 'https://maps.app.goo.gl/cArjxhpeoDLT8NC49',
    cards: {
      locationTitle: 'Địa điểm chính thức',
      locationDesc: 'Hội trường lớn Tòa nhà A, Trường Đại học Tôn Đức Thắng.',
      parkingTitle: 'Cổng vào & Gửi xe',
      parkingDesc: 'Các bạn đi vào bằng Cổng 7 hoặc Cổng 5 (Đường D6). Gửi xe máy tại tầng hầm Nhà Thi Đấu (kế bên sân bóng đá) hoặc tầng hầm Tòa nhà F, D, L.',
    }
  },

  // Contact links and information
  contact: {
    heading: 'Sự hiện diện của bạn là niềm vinh hạnh lớn của mình! ❤️',
    subheading: 'Rất mong được đón tiếp bạn trong ngày lễ tốt nghiệp trọng đại này!',
    phone: '0945 629 869',
    phoneRaw: '0945629869',
    facebookUrl: 'https://facebook.com/kduong.kero/',
    facebookDisplay: 'facebook.com/kduong.kero',
  },

  // Google Sheets Apps Script Web App Integration URL
  googleScriptUrl: process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbx-GSi_AUvfJEw-VPTAnEsAsac12aaX45IPYhA0kSEP_QfT40J7koeRnGb_YsY662NDyw/exec',

  // SEO Meta & Site Branding
  meta: {
    title: 'My Special Day! - Graduation Invitation 🎓',
    description: 'Thiệp mời tham dự Lễ Tốt Nghiệp Đại học Tôn Đức Thắng',
    icon: '/assets/graduation-symbol.png',
  },

  // Footer copyright
  footer: {
    copyright: '© 2026 Khương Dương. All rights reserved.',
  },

  // Default Memory Wall fallbacks
  defaultMemories: []
};
