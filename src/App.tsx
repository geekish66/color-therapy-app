// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PayPalButtons } from "@paypal/react-paypal-js";

/* ── CSS ── */
const injectCSS = () => {
  if (document.getElementById("wcs")) return;
  const s = document.createElement("style");
  s.id = "wcs";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Noto+Serif+KR:wght@300;400&display=swap');

    @keyframes pm{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.6);opacity:0.4}}
    @keyframes fiu{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes gs{0%{background-position:-200%}100%{background-position:200%}}
    @keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadeOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(1.03)}}
    @keyframes fadeIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}

    /* Orb breathing animations — each on its own timing so they feel alive */
    @keyframes orbit{from{transform:rotate(0deg) translateX(108px)}to{transform:rotate(360deg) translateX(108px)}}
    @keyframes circleGlow{0%,100%{box-shadow:0 0 60px 20px rgba(82,183,157,0.18),0 0 120px 50px rgba(82,183,157,0.08)}50%{box-shadow:0 0 80px 30px rgba(82,183,157,0.28),0 0 160px 70px rgba(82,183,157,0.12)}}
    @keyframes yinRotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}

    .orbit-dot{animation:orbit 5s linear infinite;transform-origin:0 0}
    .circle-glow{animation:circleGlow 4s ease-in-out infinite}
    .yin-rotate{animation:yinRotate 18s linear infinite}

    .pm{animation:pm 2s ease-in-out infinite}
    .fiu{animation:fiu 0.55s ease-out forwards;opacity:0}
    .gs{background:linear-gradient(90deg,#92702A,#D4AF37,#F5D06E,#D4AF37,#92702A);background-size:300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gs 4s linear infinite}
    .fl{animation:fl 3.5s ease-in-out infinite}
    .spin{animation:spin 1s linear infinite}
    .blur-sm-custom{filter:blur(5px);user-select:none;pointer-events:none}

    .landing-fade-out{animation:fadeOut 0.65s ease-in-out forwards}
    .screen-fade-in{animation:fadeIn 0.55s ease-out forwards}

    .serif-ko{font-family:'Noto Serif KR','Cormorant Garamond',Georgia,serif}
    .serif-en{font-family:'Cormorant Garamond',Georgia,serif}
  `;
  document.head.appendChild(s);
};

/* ── TOOLTIP ── */
const TIPS = {
  "미병":"아직 질병이 아닌, 몸이 보내는 불편함의 신호. '아프기 전 단계'",
  "진액":"몸속 수분·영양분을 포함한 생체 액체. 피부·관절을 촉촉하게 유지하는 체내 윤활유",
  "열독":"몸속 과도한 열 에너지. 염증·통증·상열감의 주요 원인",
  "정기":"외부 나쁜 기운을 막는 몸의 생명 에너지. '면역력'과 유사한 개념",
  "사기":"질병을 유발하는 나쁜 외부 기운",
  "기허":"몸의 기운이 부족한 상태. 피로·무기력·면역 저하로 나타남",
  "냉증":"체내 순환이 막혀 특정 부위가 차가워지는 만성 상태",
  "경문혈":"신장 기운이 모이는 혈자리. 옆구리 하단 마지막 갈비뼈 끝",
  "기문혈":"간 기운이 모이는 혈자리. 젖꼭지 바로 아래 갈비뼈가 끝나는 지점",
  "중부혈":"폐 기운이 모이는 혈자리. 쇄골 바깥쪽 아래 오목한 부위",
  "거궐혈":"심장 기운이 모이는 혈자리. 명치 바로 아래 약 2cm",
  "관원혈":"생명력의 근원 혈자리. 배꼽 아래 4~5cm (단전)",
  "천추혈":"대장 기운이 모이는 혈자리. 배꼽 양옆 약 5cm",
  "복모혈":"장기의 기운이 배 쪽으로 모이는 핵심 혈자리",
  "수독":"수분 대사가 막혀 몸에 물이 고이는 상태. 부종의 주요 원인",
  "아시혈":"누르면 통증이 가장 심하게 느껴지는 특정 압통 부위",
};

function Tip({ k, children }) {
  if (!TIPS[k]) return <>{children}</>;
  return (
    <span className="font-semibold" style={{ color:"#92610A" }}>
      {children}
      <span className="font-normal text-stone-500" style={{ fontSize:"0.85em" }}>
        ({TIPS[k]})
      </span>
    </span>
  );
}

/* ── FAKE QUESTIONS ── */
const FQS = [
  {q:"스트레스를 받을 때 당신은?",opts:["🌲 자연 속을 걷는다","🎵 음악을 크게 튼다","🤝 친구와 대화한다","📚 혼자 조용히 있는다","🏃 몸을 움직인다"]},
  {q:"가장 마음이 편안해지는 공간은?",opts:["🏔️ 산속 조용한 오두막","🌊 바다가 보이는 카페","🌲 고요한 숲속","🏙️ 활기찬 도시 거리","🌾 드넓은 들판과 초원"]},
  {q:"하루 중 가장 에너지가 넘치는 시간대는?",opts:["🌅 이른 아침 5~7시","☀️ 오전 9~11시","🌞 점심 12~14시","🌇 저녁 18~20시","🌙 밤 22시 이후"]},
  {q:"중요한 결정을 내릴 때 당신은?",opts:["⚡ 직감으로 즉시 결정","📊 데이터와 논리로 분석","💬 주변 의견을 충분히 듣고","🧘 혼자 오래 생각한 후","🎯 과거 경험에 비추어"]},
  {q:"지금 가장 끌리는 색감은?",opts:["🔴 강렬한 레드·오렌지","💙 차분한 블루·네이비","💚 생기 있는 그린·민트","⚪ 고요한 화이트·아이보리","🟣 신비로운 퍼플"]},
  {q:"인간관계에서 당신의 역할은?",opts:["🦁 모두를 이끄는 리더","🌟 분위기를 살리는 에너자이저","🕊️ 갈등을 조율하는 중재자","🎯 묵묵히 지원하는 서포터","🦉 상황을 분석하는 관찰자"]},
  {q:"문제가 생겼을 때 당신은?",opts:["⚡ 즉시 행동으로 해결","🗺️ 계획 세우고 단계적으로","💬 도움을 요청하거나 상의","🧘 잠시 멈추고 상황 파악","📝 모든 가능성을 검토 후"]},
  {q:"이상적인 주말은?",opts:["🏕️ 산이나 바다로 훌쩍 여행","🎉 친구·가족과 활기찬 모임","📖 집에서 혼자 독서와 휴식","🎨 새로운 취미와 창작 활동","☕ 동네 카페에서 여유"]},
];
const Q10_OPTS = [
  {l:"🌊 에너지를 밖으로 폭발적으로 발산한다",v:1},
  {l:"🔥 활발하지만 때론 충전이 필요하다",v:2},
  {l:"⚖️ 상황에 따라 유연하게 달라진다",v:3},
  {l:"🌿 에너지를 안으로 조용히 축적한다",v:4},
  {l:"🌑 에너지를 철저히 내부로 수렴한다",v:5},
];

/* ── COLOR CONTRAST HELPER ── */
// Returns true if hex color is "light" (needs dark text)
function isLightColor(hex) {
  const h = hex.replace("#","");
  const r = parseInt(h.slice(0,2),16);
  const g = parseInt(h.slice(2,4),16);
  const b = parseInt(h.slice(4,6),16);
  // Perceived luminance formula
  const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
  return luminance > 0.55;
}

/* ── REPORT DATA ── */
const REPORTS = {
  "木_Yang":{
    title:"목형(木型) · 양인(Yang)",subtitle:"푸른 생명력으로 간의 열독을 배출하라",
    element:"木",elemoji:"🌿",elemColor:"#2D6A4F",organ:"간(肝) · 담(膽)",
    engineSeason:"겨울 (음력 10~12월)",fuelSeason:"봄 (음력 1~3월)",
    engineDesc:"강력한 수(水) 엔진이 목(木) 연료를 폭발적으로 밀어주지만, 양인(Yang)의 발산 특성으로 간에 열이 과도하게 쌓이는 만성 과열 상태에 빠질 위험이 높습니다.",
    fuelDesc:"봄에 잉태된 당신은 녹색 파장 에너지가 선천적으로 부족합니다. 간(肝)과 담(膽)은 평생 채워야 할 빈 연료통과 같습니다.",
    personality:"재주가 많고 상황 판단이 빠른 영리함을 지니고 있습니다. 시작하는 힘이 넘치지만, 끝을 맺는 끈기가 다소 부족한 것이 약점입니다.",
    emotionWarn:"간 기운이 떨어지면 극도로 조급해지며, 사소한 일에도 화를 터뜨리는 노(怒)하는 마음이 강해집니다. 이는 간이 보내는 강력한 적신호입니다.",
    symptoms:[
      {i:"😴",t:"만성 피로",d:"간의 혈액·영양소 저장 기능이 약해 남들과 같이 활동해도 에너지가 금방 고갈됩니다."},
      {i:"👁️",t:"시각 기관 취약",d:"간 건강은 눈과 직결됩니다. 화면을 오래 보면 어지러움과 극심한 눈 피로가 생깁니다."},
      {i:"⚖️",t:"비만·과잉 대사",d:"소화 흡수율이 높아(120%) 먹은 에너지가 과잉 저장됩니다. 반드시 땀을 흘려 열독을 배출해야 합니다."},
    ],
    keyTaste:"신맛 (Sour)",keyTasteDesc:"흩어진 간의 에너지를 모아주고 보강합니다.",
    rec:["오미자차","녹즙 (케일·신선초)","생채소 샐러드","현미밥","등푸른 생선"],
    avoid:["술·음주","과도한 육류","밀가루 음식"],
    exercise:"스트레칭·유연 체조(매일 필수) + 숨이 차고 땀을 흠뻑 흘리는 강도 높은 유산소 운동.",
    color:"#1B4332",colorName:"짙은 청록색 (Deep Teal)",
    colorDesc:"열이 많은 양인은 깊고 짙은 청록색 파장으로 펄펄 끓는 간의 열독을 강력하게 식혀야 합니다.",
    steps:[
      {n:1,t:"에너지 통로 열기",loc:"엄지손가락 첫째 마디",side:"남성 좌측 / 여성 우측",c:"#1B4332",cn:"청록색",part:"hand",finger:"thumb",d:"간·담의 에너지 통로를 열어주는 마스터 스위치입니다."},
      {n:2,t:"장기 직접 타격",loc:"기문혈 (期門)",locD:"젖가슴 바로 아래 갈비뼈 끝",side:"남성 좌측 / 여성 우측",c:"#1B4332",cn:"청록색",part:"torso",point:"jiMen",d:"간 기운이 모이는 대표점. 청록색 에너지 투입 시 뭉친 간 기운이 풀립니다."},
      {n:3,t:"전신 기력 폭발",loc:"왼발 엄지발가락 첫째 마디",side:"남녀 공통 (왼발)",c:"#1B4332",cn:"청록색",part:"foot",toe:"leftBig",d:"신체의 근원적인 정기를 밑바닥부터 강하게 끌어올리는 마스터 스위치입니다."},
    ],
    emg:[
      {s:"급성 통증 (근육·관절통)",c:"보라색 (Purple)",l:"통증이 가장 심한 부위 (아시혈)"},
      {s:"열·염증 반응",c:"백색·청색 (White·Blue)",l:"열이 나는 환부"},
      {s:"스트레스성 급성 위통",c:"황색+보라색 (Yellow+Purple)",l:"명치와 배꼽 중간 중완혈"},
    ]
  },
  "木_Yin":{
    title:"목형(木型) · 음인(Yin)",subtitle:"따뜻한 연두빛 파장으로 얼어붙은 간을 깨워라",
    element:"木",elemoji:"🌿",elemColor:"#52B788",organ:"간(肝) · 담(膽)",
    engineSeason:"겨울 (음력 10~12월)",fuelSeason:"봄 (음력 1~3월)",
    engineDesc:"겨울의 차가운 수(水) 기운이 간의 생명력을 돕기는커녕 오히려 얼어붙게 만듭니다. 음인(Yin)의 수렴 특성까지 더해져 만성 에너지 저하와 냉증(冷症)이 유발됩니다.",
    fuelDesc:"봄에 잉태된 당신은 녹색 파장 에너지가 선천적으로 부족합니다. 간(肝)과 담(膽)은 평생 채워야 할 빈 연료통입니다.",
    personality:"매사에 꼼꼼하고 타인을 뒤에서 조용히 돕는 내조의 능력이 탁월합니다. 겉으로 드러내기보다 속으로 깊이 생각하는 신중한 타입입니다.",
    emotionWarn:"간 기운이 차가워지면 타인의 제안에 끊임없이 비판적으로 따지는 경향이 강해지고, 비관적인 정서와 속앓이가 심해집니다.",
    symptoms:[
      {i:"🥶",t:"만성 에너지 결핍",d:"소화 흡수율 90% 수준으로 아무리 좋은 음식도 에너지 전환이 안 돼 늘 무기력합니다."},
      {i:"💧",t:"기운의 누수",d:"땀은 음인에게 생명수(진액)입니다. 땀을 흘리면 기운이 함께 빠져나가 회복에 오랜 시간이 걸립니다."},
      {i:"🦵",t:"차가운 소화기·근육 경직",d:"위장이 차서 찬 음식에 배탈이 납니다. 간 기운 부족으로 근육에 쥐가 나고 어깨가 자주 굳습니다."},
    ],
    keyTaste:"따뜻한 신맛 (Warm Sour)",keyTasteDesc:"신맛으로 간을 보강하되 반드시 따뜻한 성질의 신맛을 선택해야 합니다.",
    rec:["따뜻한 모과차·유자차","팥죽","닭고기","부추"],
    avoid:["찬 음료·냉수","생야채 샐러드 (익혀서 드세요)","돼지고기","아이스크림"],
    exercise:"체온 유지 최우선. 땀이 맺힐 듯 말 듯 한 가벼운 걷기, 부드러운 요가·스트레칭. 사우나·고강도 유산소 절대 금지.",
    color:"#74C69D",colorName:"밝은 연두색 (Light Green)",
    colorDesc:"차가운 음인은 봄날의 새싹처럼 따뜻하고 생기 넘치는 밝은 연두색으로 얼어붙은 간을 깨워야 합니다.",
    steps:[
      {n:1,t:"간의 에너지 통로 데우기",loc:"엄지손가락 첫째 마디",side:"남성 좌측 / 여성 우측",c:"#74C69D",cn:"연두색",part:"hand",finger:"thumb",d:"얼어붙은 간 맥락에 따뜻한 연두색 온기를 주입합니다."},
      {n:2,t:"얼어붙은 장기 해동",loc:"기문혈 (期門)",locD:"젖가슴 바로 아래 갈비뼈 끝",side:"남성 좌측 / 여성 우측",c:"#74C69D",cn:"연두색",part:"torso",point:"jiMen",d:"연두색 에너지 투입 시 위축된 간이 부드럽게 풀리며 소화가 시작됩니다."},
      {n:3,t:"[음인 전용] 생명력의 뿌리 보강",loc:"우측 새끼발가락 첫째 마디",side:"남녀 공통 (오른발)",c:"#1B1B1B",cn:"흑색",part:"foot",toe:"rightPinky",d:"부족한 하체 기운과 차가운 신장의 원기를 동시에 채워주는 강력한 부스터입니다."},
    ],
    emg:[
      {s:"극심한 수족냉증·하복부 냉증",c:"적색 (Red)",l:"배꼽 아래 하단전"},
      {s:"신경성 위경련·체함",c:"황색 (Yellow)",l:"명치와 배꼽 중간 중완혈"},
      {s:"무기력·우울감",c:"분홍색 (Pink)",l:"손목 안쪽 신문혈"},
    ]
  },
  "火_Yang":{
    title:"화형(火型) · 양인(Yang)",subtitle:"심장의 과열을 다스려 생명의 균형을 잡아라",
    element:"火",elemoji:"🔥",elemColor:"#DC2626",organ:"심장(心) · 소장(小腸)",
    engineSeason:"봄 (음력 1~3월)",fuelSeason:"여름 (음력 4~6월)",
    engineDesc:"강력한 목(木) 엔진이 화(火) 기운에 끊임없이 땔감을 공급하고, 양인(Yang)의 발산 특성까지 더해져 심장은 제어 없이 타오르는 만성 과열 상태에 놓입니다.",
    fuelDesc:"여름에 잉태된 당신은 적색 파장 에너지가 선천적으로 부족합니다. 심장(心)과 소장(小腸)은 평생 채워야 할 빈 연료통으로, 심혈관계가 가장 먼저 타격을 받습니다.",
    personality:"열정이 넘치고 명랑하며 주변을 환하게 밝히는 에너지를 지녔습니다. 일에 착수할 때 누구보다 뜨거운 몰입도를 보여줍니다.",
    emotionWarn:"심장이 과열되면 별일 아닌 것에도 크게 웃거나 말이 많아집니다. 에너지가 소진될 때는 이유 없는 불안·가슴 두근거림으로 감정의 롤러코스터를 탑니다.",
    symptoms:[
      {i:"💓",t:"심혈관 압박·심계항진",d:"심장이 남들보다 빠르게 혈액을 뿜어냅니다. 가슴이 꽉 막힌 답답함과 두근거림(심계항진)을 자주 경험합니다."},
      {i:"🌡️",t:"상열감·안면 홍조",d:"체내 열기가 머리·얼굴로 솟구쳐 안면 홍조와 상열감, 심하면 뒷목 뻣뻣함이 나타납니다."},
      {i:"😴",t:"수면 장애",d:"뇌·심장에 열이 차 교감신경이 가라앉지 않아 얕은 잠을 자거나 쉽게 깹니다."},
    ],
    keyTaste:"쓴맛 (Bitter)",keyTasteDesc:"심장의 열기를 서늘하게 식혀주는 핵심 맛입니다.",
    rec:["씀바귀","고들빼기","도라지","쑥","시원한 토마토주스","오이냉국"],
    avoid:["고카페인 음료","매운 음식","인삼·홍삼류"],
    exercise:"가슴을 활짝 펴는 요가, 모관 운동(손발 털기). 땀을 흠뻑 흘리는 유산소 운동으로 체내 압박감을 배출해야 합니다.",
    color:"#9B59B6",colorName:"분홍색/자주색 (Pink/Purple)",
    colorDesc:"강렬한 빨강은 심장을 자극합니다. 뜨거운 불길을 부드럽게 감싸는 분홍색이나 열기를 식혀주는 자주색이 핵심입니다.",
    steps:[
      {n:1,t:"심장 에너지 통로 다스리기",loc:"검지 첫째 마디 바깥쪽",side:"남성 좌측 / 여성 우측",c:"#D63384",cn:"분홍/자주색",part:"hand",finger:"index",d:"뻗어나가는 심장 에너지를 가장 부드럽게 안정시키는 스위치입니다."},
      {n:2,t:"심장 장기 대표점 안정화",loc:"거궐혈 (巨闕)",locD:"명치 바로 아래 약 2cm",side:"좌우 공통",c:"#D63384",cn:"분홍/자주색",part:"torso",point:"juQue",d:"이곳에 파장 투입 시 꽉 막혀 답답하던 가슴이 시원하게 열립니다."},
      {n:3,t:"[양인 전용] 일상 컬러 테라피",loc:"넥타이·속옷·스카프 등 의류",side:"전신 활용",c:"#DC2626",cn:"적색·분홍색",part:"clothing",d:"적색·분홍색 의류 착용만으로도 오행의 밸런스를 잡는 훌륭한 효과가 있습니다."},
    ],
    emg:[
      {s:"갑작스러운 두통·뒷목 뻣뻣함",c:"청색·백색 (Blue·White)",l:"목덜미 부위"},
      {s:"급성 신경성 위염",c:"황색+보라색 (Yellow+Purple)",l:"명치와 배꼽 중간 중완혈"},
    ]
  },
  "火_Yin":{
    title:"화형(火型) · 음인(Yin)",subtitle:"심장의 불씨를 살려 차가운 몸을 데워라",
    element:"火",elemoji:"🔥",elemColor:"#DC2626",organ:"심장(心) · 소장(小腸)",
    engineSeason:"봄 (음력 1~3월)",fuelSeason:"여름 (음력 4~6월)",
    engineDesc:"목(木) 엔진이 화(火)를 살려줘야 하지만, 음인(Yin)의 수축 특성으로 심장의 불꽃이 바람 앞의 등불처럼 위태롭게 깜빡입니다. 심장 펌프질이 약해져 전신에 따뜻한 피를 보내지 못하는 만성 에너지 저하 상태입니다.",
    fuelDesc:"여름에 잉태된 당신은 적색 파장 에너지가 선천적으로 부족합니다. 심장(心)과 소장(小腸)은 평생 채워야 할 빈 연료통입니다.",
    personality:"타고난 화(火)의 따뜻함으로 타인을 향한 인정(人情)이 매우 많고, 상처받은 사람을 깊이 공감하고 품어주는 다정한 성격입니다.",
    emotionWarn:"심장 기운이 위축되면 '혹시 잘못되면 어쩌지?' 하는 불안감과 소심함이 강해집니다. 이 속앓이가 심장 활동력을 직접적으로 짓누르는 가장 큰 원인입니다.",
    symptoms:[
      {i:"🥶",t:"하복부 냉기·소화 장애",d:"아랫배와 소화기가 근본적으로 차갑습니다. 찬 음식에 잦은 설사·복통으로 영양 흡수가 안 됩니다."},
      {i:"🔥",t:"상기증 (기운의 충돌)",d:"아랫배의 냉기가 열을 위로 밀어내 배·손발은 얼음장인데 얼굴은 화끈거리는 극심한 불균형이 생깁니다."},
      {i:"💆",t:"만성 근육 경직",d:"심장 박출력이 약해 말초까지 피가 닿지 않아 어깨 결림과 목덜미 통증을 만성적으로 달고 삽니다."},
    ],
    keyTaste:"따뜻한 음식 (Warming Foods)",keyTasteDesc:"몸의 보일러를 켜줄 따뜻한 성질의 음식이 최우선입니다.",
    rec:["대추차(물처럼)","따뜻한 팥죽","수수부꾸미","익힌 따뜻한 토마토 스튜"],
    avoid:["아이스 커피","냉수·빙수","모든 차가운 음식"],
    exercise:"심박수를 급격히 올리는 운동 금지. 가벼운 산책·스트레칭. 잠자기 전 하복부에 따뜻한 찜질팩 사용이 특급 비법입니다.",
    color:"#DC2626",colorName:"선명한 빨강색 (Vivid Red)",
    colorDesc:"꺼져가는 심장의 불씨를 강력하게 살려내고 얼어붙은 몸을 훈훈하게 데우기 위해 선명하고 강렬한 빨강색이 필요합니다.",
    steps:[
      {n:1,t:"심장 에너지 통로 재가동",loc:"검지 첫째 마디 바깥쪽",side:"남성 좌측 / 여성 우측",c:"#DC2626",cn:"선명한 빨강색",part:"hand",finger:"index",d:"멈춰가는 심장 맥락에 뜨거운 열기를 주입합니다."},
      {n:2,t:"얼어붙은 심장 모혈 해동",loc:"거궐혈 (巨闕)",locD:"명치 바로 아래 약 2cm",side:"좌우 공통",c:"#DC2626",cn:"선명한 빨강색",part:"torso",point:"juQue",d:"강력한 적색 파장으로 위축된 가슴이 열리며 뱃속이 점차 따뜻해집니다."},
      {n:3,t:"[음인 전용] 단전 보일러 가동",loc:"관원혈 (關元·단전)",locD:"배꼽 아래 4~5cm",side:"좌우 공통",c:"#DC2626",cn:"선명한 빨강색",part:"torso",point:"guanYuan",d:"전신을 데우는 강력한 난로 역할을 합니다."},
    ],
    emg:[
      {s:"이유 없는 불안·우울",c:"분홍색 (Pink)",l:"손목 안쪽 신문혈"},
      {s:"극심한 생리통·하복부 통증",c:"보라색+적색 (Purple+Red)",l:"아픈 아랫배 (아시혈)"},
    ]
  },
  "金_Yang":{
    title:"금형(金型) · 양인(Yang)",subtitle:"순백의 에너지로 폐의 건조한 열기를 식혀라",
    element:"金",elemoji:"⚡",elemColor:"#6B7280",organ:"폐(肺) · 대장(大腸)",
    engineSeason:"여름 (음력 4~6월)",fuelSeason:"가을 (음력 7~9월)",
    engineDesc:"뜨거운 화(火) 엔진이 안 그래도 수분이 부족한 금(金)의 장기(폐·대장)를 지속적으로 달구고 수분을 증발시킵니다. 양인(Yang)의 발산 특성까지 더해져 폐는 항상 바짝 메마른 만성 열사(熱邪) 상태입니다.",
    fuelDesc:"가을에 잉태된 당신은 백색 파장 에너지와 수분이 선천적으로 부족합니다. 폐(肺)와 대장(大腸)은 평생 채워야 할 빈 연료통입니다.",
    personality:"맺고 끊음이 확실하며 원칙을 중시하고 의리가 있습니다. 평소에는 명랑하고 리더십을 발휘하는 든든한 사람입니다.",
    emotionWarn:"폐의 진액이 마르면 슬픔(悲)과 우울의 스위치가 켜집니다. 겉으로는 밝아 보이지만 혼자 있을 때 깊은 고독감을 느끼고 세상을 비관적으로 보게 됩니다.",
    symptoms:[
      {i:"🫁",t:"호흡기 점막 건조증",d:"폐·기관지가 수분 부족으로 환절기에 극도로 취약합니다. 마른기침, 안구 건조, 비염을 만성적으로 달고 삽니다."},
      {i:"🌿",t:"피부 호흡 저하",d:"피부는 제2의 폐. 폐에 열이 차면 피부도 거칠어지며 가려움증·알레르기성 피부염·아토피가 발현됩니다."},
      {i:"💨",t:"대장 가스·팽만감",d:"대장도 열기를 받아 건조해집니다. 변비가 오거나 가스가 심하게 차고 더부룩한 팽만감을 자주 느낍니다."},
    ],
    keyTaste:"서늘한 매운맛 (Cool Pungent)",keyTasteDesc:"열이 많은 양인이므로 서늘하고 수분이 가득한 매운맛을 섭취해야 합니다.",
    rec:["배","무","동치미 국물","콩나물국","백도 복숭아"],
    avoid:["맵고 짠 자극적 찌개","튀긴 음식","건조한 과자류"],
    exercise:"등산·복식호흡. 약간 숨이 차고 땀을 흘리는 유산소 운동으로 피부 독소를 배출하고 대장 가스를 빼줍니다.",
    color:"#E8E8E8",colorName:"순백색 (Pure White)",
    colorDesc:"폐가 건조하고 열이 많은 양인은 눈보라처럼 맑고 차가운 순백색 파장으로 열기를 식혀야 합니다.",
    steps:[
      {n:1,t:"호흡기 에너지 통로 정화",loc:"약지 첫째 마디",side:"남성 좌측 / 여성 우측",c:"#D0D0D0",cn:"순백색",part:"hand",finger:"ring",d:"탁해진 호흡기의 기운을 맑게 걸러내는 정수기 필터 역할입니다."},
      {n:2,t:"폐 장기 대표점 해열",loc:"중부혈 (中府)",locD:"쇄골 바깥쪽 아래 오목한 부위",side:"남성 좌측 / 여성 우측",c:"#D0D0D0",cn:"순백색",part:"torso",point:"zhongFu",d:"백색 파장 투입 시 답답하던 숨통이 트이고 맑은 공기가 들어옵니다."},
      {n:3,t:"[양인 전용] 대장 기능 강화",loc:"천추혈 (天樞)",locD:"배꼽 양옆 약 5cm 지점",side:"좌우 양쪽",c:"#EAB308",cn:"황색",part:"torso",point:"tianShu",d:"토생금(土生金) 원리로 대장을 튼튼하게 합니다."},
    ],
    emg:[
      {s:"비염·코막힘",c:"백색 (White)",l:"코 양옆 움푹한 곳 (영향혈)"},
      {s:"피부 가려움·두드러기",c:"청색·백색 (Blue·White)",l:"가려운 환부 주변"},
    ]
  },
  "金_Yin":{
    title:"금형(金型) · 음인(Yin)",subtitle:"따뜻한 크림빛 에너지로 얼어붙은 폐를 덥혀라",
    element:"金",elemoji:"⚡",elemColor:"#6B7280",organ:"폐(肺) · 대장(大腸)",
    engineSeason:"여름 (음력 4~6월)",fuelSeason:"가을 (음력 7~9월)",
    engineDesc:"화(火) 엔진이 폐를 따뜻하게 덥혀줘야 하지만, 음인(Yin)의 수축 특성으로 심장의 불꽃이 위축되어버립니다. 폐와 대장은 차갑게 얼어붙고 기허(氣虛) 상태에 빠집니다.",
    fuelDesc:"가을에 잉태된 당신은 백색 파장 에너지가 선천적으로 부족합니다. 폐(肺)와 대장(大腸)은 평생 채워야 할 빈 연료통입니다.",
    personality:"겉으로 내색하지 않고 속으로 인내하며 희생하는 매우 섬세하고 차분한 성격입니다.",
    emotionWarn:"호흡기 기운이 얼어붙으면 작은 일에도 눈물이 많아지고 깊은 비애감에 빠집니다. '결국 다 소용없어'라는 극단적인 비관주의에 사로잡히기 쉽습니다.",
    symptoms:[
      {i:"🤧",t:"차가운 호흡기·만성 알레르기",d:"폐가 차서 찬 공기에 기관지가 심하게 수축합니다. 만성 비염, 천식, 잦은 감기를 고질병처럼 앓습니다."},
      {i:"🚽",t:"대장 무력증",d:"차가운 기운이 장의 움직임을 둔화시킵니다. 무력성 변비나 찬 음식에 복통·묽은 변이 생깁니다."},
      {i:"😓",t:"기력 저하·식은땀",d:"피부 방어벽이 얇아 추위를 심하게 탑니다. 조금만 움직여도 기운 빠지는 식은땀(자한)을 흘립니다."},
    ],
    keyTaste:"따뜻한 매운맛 (Warm Pungent)",keyTasteDesc:"몸속 보일러를 켜줄 따뜻한 성질의 매운맛이 핵심입니다.",
    rec:["생강차","꿀에 잰 도라지청","구운 마늘","수정과(계피)","따뜻한 잣죽·호두"],
    avoid:["생무·찬 동치미","아이스 음료","모든 차가운 화이트 푸드 (익혀서)"],
    exercise:"땀구멍을 닫아 기운 누수를 막아야 합니다. 숲속 걷기, 단전 호흡. 마른 수건으로 피부를 문질러 온도를 높이는 건포마찰이 기적의 건강법입니다.",
    color:"#FFFDD0",colorName:"아이보리/크림색 (Ivory/Cream)",
    colorDesc:"차가운 음인에게 눈처럼 찬 순백색은 몸을 춥게 합니다. 부드럽고 따뜻한 온기가 감도는 아이보리·크림색으로 얼어붙은 폐를 감싸야 합니다.",
    steps:[
      {n:1,t:"호흡기 에너지 통로 보온",loc:"약지 첫째 마디",side:"남성 좌측 / 여성 우측",c:"#FFFACD",cn:"크림색",part:"hand",finger:"ring",d:"얼어붙은 호흡기 맥락에 부드러운 온기를 주입하는 스위치입니다."},
      {n:2,t:"얼어붙은 폐 장기 해동",loc:"중부혈 (中府)",locD:"쇄골 바깥쪽 아래 오목한 부위",side:"남성 좌측 / 여성 우측",c:"#FFFACD",cn:"크림색",part:"torso",point:"zhongFu",d:"크림색 파장으로 잦은 기침이 멎고 가슴이 훈훈해집니다."},
      {n:3,t:"[음인 전용] 단전 보일러 가동",loc:"관원혈 (關元·단전)",locD:"배꼽 아래 4~5cm",side:"좌우 공통",c:"#DC2626",cn:"적색",part:"torso",point:"guanYuan",d:"하복부의 붉은 열기가 위로 솟아올라 차가운 폐를 데워주는 완벽한 순환을 만듭니다."},
    ],
    emg:[
      {s:"우울감·무기력",c:"분홍색 (Pink)",l:"가슴 정중앙 (단중혈)"},
      {s:"만성 설사·하복부 통증",c:"황색+보라색 (Yellow+Purple)",l:"배꼽 주변 (아시혈)"},
    ]
  },
  "水_Yang":{
    title:"수형(水型) · 양인(Yang)",subtitle:"칠흑의 에너지로 신장의 열독을 응집하라",
    element:"水",elemoji:"💧",elemColor:"#1E40AF",organ:"신장(腎) · 방광(膀胱)",
    engineSeason:"가을 (음력 7~9월)",fuelSeason:"겨울 (음력 10~12월)",
    engineDesc:"강력한 금(金) 엔진이 신장·방광에 끊임없이 에너지를 공급하지만, 양인(Yang)의 발산 특성으로 에너지가 차분히 저장되지 못하고 소용돌이치며 만성 열독(熱毒)이 쌓입니다.",
    fuelDesc:"겨울에 잉태된 당신은 흑색 파장 에너지와 근원적인 열기가 선천적으로 부족합니다. 신장(腎)·방광(膀胱)·뼈(骨)는 평생 채워야 할 빈 연료통이며, 하체와 비뇨생식기가 가장 먼저 타격을 받습니다.",
    personality:"지혜롭고 끈기가 있으며 한번 목표를 정하면 끝까지 밀고 나가는 무서운 저력을 지녔습니다. 어떤 환경에서도 살아남는 강인한 생명력의 소유자입니다.",
    emotionWarn:"신장에 열독이 차오르면 알 수 없는 두려움과 피해의식에 사로잡히기 쉽습니다. 하체로 가야 할 기운이 머리로 뻗쳐 극도로 고집스러워집니다.",
    symptoms:[
      {i:"🦴",t:"하체 기운 단절·요통",d:"신장 에너지는 허리·골반·다리를 주관합니다. 만성 허리 통증, 척추 디스크, 무릎 시큰거림이 나타납니다."},
      {i:"👂",t:"청각 기관 경고",d:"신장 건강은 귀로 열립니다. 열독이 쌓이면 이명증, 잦은 중이염, 돌발성 난청의 형태로 경고 신호를 보냅니다."},
      {i:"🫀",t:"비뇨생식기 과부하",d:"남성은 전립선 압박으로 정력 감퇴·배뇨 장애가 빠르게 옵니다. 여성은 방광염·자궁 염증에 쉽게 노출됩니다."},
    ],
    keyTaste:"짠맛 (Salty) + 블랙 푸드",keyTasteDesc:"신장의 열독을 빼고 진액을 채우는 핵심 맛입니다.",
    rec:["검은콩국수","전복","해삼","미역국","다시마 피클","천일염·죽염으로 간"],
    avoid:["극단적 무염식 (저나트륨)","단 빵·아이스크림","설탕 폭탄 음식"],
    exercise:"스쿼트, 계단 오르기, 빠르게 걷기. 하체 운동으로 땀을 흠뻑 흘려야 신장의 열독이 배출되어 허리와 귀가 맑아집니다.",
    color:"#1a1a1a",colorName:"짙은 검정색 (Deep Black)",
    colorDesc:"우주의 블랙홀처럼 모든 기운을 빨아들이고 차분하게 식혀 응집시키는 가장 짙은 검정색 파장이 핵심입니다.",
    steps:[
      {n:1,t:"비뇨생식기 에너지 통로 응집",loc:"새끼손가락 첫째 마디",side:"남성 좌측 / 여성 우측",c:"#1a1a1a",cn:"짙은 검정색",part:"hand",finger:"pinky",d:"흩어지는 하체 에너지를 끌어모아 단단하게 묶어두는 마스터 스위치입니다."},
      {n:2,t:"신장 장기 대표점 해열",loc:"경문혈 (京門)",locD:"옆구리 하단 마지막 갈비뼈 끝",side:"남성 좌측 / 여성 우측",c:"#1a1a1a",cn:"짙은 검정색",part:"torso",point:"jingMen",d:"흑색 파장 투입 시 허리를 짓누르던 열독이 풀리며 요통이 가라앉습니다."},
      {n:3,t:"[양인 전용] 근원 정기 폭발",loc:"우측 새끼발가락 첫째 마디",side:"남녀 공통 (오른발)",c:"#1a1a1a",cn:"짙은 검정색",part:"foot",toe:"rightPinky",d:"다리에 힘이 붙고 이명증이 호전되는 강력한 부스터입니다."},
    ],
    emg:[
      {s:"급성 요통·디스크 통증",c:"보라색 (Purple)",l:"통증이 가장 심한 허리 부위 (아시혈)"},
      {s:"급성 방광염·빈뇨",c:"백색+청색 (White+Blue)",l:"하복부 방광 위치"},
    ]
  },
  "水_Yin":{
    title:"수형(水型) · 음인(Yin)",subtitle:"따뜻한 숯빛 에너지로 얼어붙은 신장을 보호하라",
    element:"水",elemoji:"💧",elemColor:"#1E40AF",organ:"신장(腎) · 방광(膀胱)",
    engineSeason:"가을 (음력 7~9월)",fuelSeason:"겨울 (음력 10~12월)",
    engineDesc:"금(金) 엔진이 수(水)를 도와줘야 하지만, 음인(Yin)의 차가운 성질과 겨울 잉태의 부족함이 만나 신장과 비뇨생식기는 얼음덩어리처럼 굳어버립니다. 극심한 냉증과 정기 허탈 상태에 빠지기 쉽습니다.",
    fuelDesc:"겨울에 잉태된 당신은 흑색 파장 에너지와 온기가 선천적으로 부족합니다. 신장(腎)·방광(膀胱)·자궁/전립선은 평생 채워야 할 빈 연료통입니다.",
    personality:"물(水)의 포용력을 지닌 음인답게 남의 이야기를 진심으로 깊이 들어주는 최고의 리스너입니다. 뒤에서 조용히 상황을 관망하고 양보하는 미덕을 지녔습니다.",
    emotionWarn:"신장 기운이 얼어붙으면 '사람들이 나를 싫어하면 어쩌지?', '앞으로 어떻게 살아야 하나' 하는 실체 없는 깊은 우울과 공포감이 영혼을 잠식합니다.",
    symptoms:[
      {i:"🥶",t:"극심한 수족냉증·뼈의 시림",d:"하체와 신장이 시베리아처럼 차갑습니다. 두꺼운 양말을 신어도 발이 시려 잠을 이루지 못하고 뼈속까지 시림을 느낍니다."},
      {i:"🌙",t:"비뇨생식기 냉증",d:"여성은 극심한 생리통·자궁근종에 취약합니다. 남성은 하복부가 늘 뻐근합니다. 야간 빈뇨도 얼어붙은 방광의 신호입니다."},
      {i:"💧",t:"만성 부종·무기력",d:"신장 보일러가 꺼져 마신 물이 고여 붓고(수독), 솜털처럼 가라앉는 무기력증에 시달립니다."},
    ],
    keyTaste:"따뜻한 짠맛 + 블랙 푸드",keyTasteDesc:"신장을 덥히고 원기를 채우는 따뜻한 성질의 짠맛과 블랙 푸드가 핵심입니다.",
    rec:["따뜻한 두유","흑임자죽","추어탕","미꾸라지","장어 (모두 따뜻하게)"],
    avoid:["찬 수박","얼음물","차가운 생선회","모든 찬 음식"],
    exercise:"땀구멍을 닫아 체온과 기운을 보호해야 합니다. 따뜻한 실내에서 발바닥(용천혈) 지압, 가벼운 요가·코어 강화로 하단전에 열을 모으는 훈련이 필요합니다.",
    color:"#4B5563",colorName:"차콜/웜그레이 (Charcoal/Warm Grey)",
    colorDesc:"기운이 얼어붙은 음인에게 칠흑 같은 검정색은 오히려 몸을 춥게 합니다. 부드럽고 따뜻한 온기가 감도는 차콜·웜그레이로 얼어붙은 신장을 포근하게 감싸야 합니다.",
    steps:[
      {n:1,t:"비뇨생식기 에너지 통로 보온",loc:"새끼손가락 첫째 마디",side:"남성 좌측 / 여성 우측",c:"#4B5563",cn:"차콜/웜그레이",part:"hand",finger:"pinky",d:"꽁꽁 언 하체 맥락에 부드러운 온기를 주입하여 야간 빈뇨를 줄이는 스위치입니다."},
      {n:2,t:"얼어붙은 신장 장기 해동",loc:"경문혈 (京門)",locD:"옆구리 하단 마지막 갈비뼈 끝",side:"남성 좌측 / 여성 우측",c:"#4B5563",cn:"차콜/웜그레이",part:"torso",point:"jingMen",d:"웜그레이 파장으로 뻣뻣하던 허리가 부드러워지고 몸이 훈훈해집니다."},
      {n:3,t:"[음인 전용] 생명력의 뿌리 강제 부팅",loc:"왼발 엄지발가락 첫째 마디",side:"남녀 공통 (왼발)",c:"#52B788",cn:"녹색",part:"foot",toe:"leftBig",d:"얼어붙은 땅에 새싹을 틔우듯 전신에 강력한 활력을 불어넣습니다."},
    ],
    emg:[
      {s:"극심한 수족냉증·자궁/전립선 냉증",c:"적색 (Red)",l:"배꼽 아래 단전 (관원혈)"},
      {s:"이유 없는 공포감·불안",c:"분홍색 (Pink)",l:"가슴 정중앙 (단중혈)"},
    ]
  },
};

/* ── UTILS ── */
function approxLunarMonth(year, month, day) {
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - 44);
  return d.getMonth() + 1;
}
function getBodyType(lunarMonth, q10) {
  let el;
  if ([10,11,12].includes(lunarMonth)) el = "木";
  else if ([1,2,3].includes(lunarMonth)) el = "火";
  else if ([4,5,6].includes(lunarMonth)) el = "金";
  else el = "水";
  const yang = q10 <= 3;
  return `${el}_${yang ? "Yang" : "Yin"}`;
}

/* ── SVG DIAGRAMS ── */
const FINGER_POS = { thumb:[38,148], index:[68,75], middle:[95,58], ring:[122,68], pinky:[146,90] };
const TORSO_PTS = {
  zhongFu:[78,65], jiMen:[82,105], juQue:[112,128], guanYuan:[112,175],
  tianShu_l:[80,160], tianShu_r:[144,160], jingMen:[55,148], jingMen_r:[169,148]
};

function HandSVG({ finger, color }) {
  const [cx, cy] = FINGER_POS[finger] || [0,0];
  const dark = color === "#E8E8E8" || color === "#D0D0D0" || color === "#FFFACD" || color === "#FFFDD0";
  return (
    <svg viewBox="0 0 184 220" className="w-full max-w-[180px]">
      <defs>
        <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDDCB5"/>
          <stop offset="100%" stopColor="#F0C08A"/>
        </linearGradient>
      </defs>
      {/* Palm */}
      <ellipse cx="95" cy="168" rx="52" ry="46" fill="url(#skin)" stroke="#D4A574" strokeWidth="1.2"/>
      {/* Thumb */}
      <ellipse cx="38" cy="148" rx="13" ry="28" fill="url(#skin)" stroke="#D4A574" strokeWidth="1.2" transform="rotate(-25 38 148)"/>
      {/* Index */}
      <rect x="62" y="72" width="20" height="82" rx="10" fill="url(#skin)" stroke="#D4A574" strokeWidth="1.2"/>
      {/* Middle */}
      <rect x="87" y="54" width="22" height="92" rx="11" fill="url(#skin)" stroke="#D4A574" strokeWidth="1.2"/>
      {/* Ring */}
      <rect x="113" y="64" width="20" height="88" rx="10" fill="url(#skin)" stroke="#D4A574" strokeWidth="1.2"/>
      {/* Pinky */}
      <rect x="137" y="85" width="17" height="72" rx="8.5" fill="url(#skin)" stroke="#D4A574" strokeWidth="1.2"/>
      {/* Finger labels */}
      {[["엄",38,46],["검",72,26],["중",98,10],["약",123,20],["소",144,42]].map(([l,x,y])=>(
        <text key={l} x={x} y={y} textAnchor="middle" fontSize="9" fill="#8B6914" fontFamily="serif">{l}</text>
      ))}
      {/* Marker */}
      <circle cx={cx} cy={cy} r="10" fill={color} stroke={dark?"#999":"white"} strokeWidth="2" opacity="0.25" className="pm"/>
      <circle cx={cx} cy={cy} r="7" fill={color} stroke={dark?"#888":"white"} strokeWidth="1.5" className="pm"/>
      <circle cx={cx} cy={cy} r="3" fill={dark?"#666":"white"}/>
    </svg>
  );
}

function TorsoSVG({ point, color }) {
  const pts = point === "tianShu"
    ? [TORSO_PTS.tianShu_l, TORSO_PTS.tianShu_r]
    : point === "jingMen"
    ? [TORSO_PTS.jingMen]
    : [TORSO_PTS[point]].filter(Boolean);
  const dark = color === "#E8E8E8" || color === "#D0D0D0" || color === "#FFFACD" || color === "#FFFDD0";
  return (
    <svg viewBox="0 0 224 220" className="w-full max-w-[200px]">
      <defs>
        <linearGradient id="body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDDCB5"/>
          <stop offset="100%" stopColor="#F0C08A"/>
        </linearGradient>
      </defs>
      {/* Neck */}
      <rect x="97" y="8" width="30" height="22" rx="8" fill="url(#body)" stroke="#D4A574" strokeWidth="1.2"/>
      {/* Torso */}
      <path d="M60 30 Q55 20 45 25 L30 55 Q28 85 35 120 Q40 155 55 185 L169 185 Q184 155 189 120 Q196 85 194 55 L179 25 Q169 20 164 30 Q140 45 112 48 Q84 45 60 30Z" fill="url(#body)" stroke="#D4A574" strokeWidth="1.2"/>
      {/* Collarbones */}
      <path d="M97 30 Q80 38 65 35" stroke="#C49A6C" strokeWidth="1" fill="none"/>
      <path d="M127 30 Q144 38 159 35" stroke="#C49A6C" strokeWidth="1" fill="none"/>
      {/* Center line */}
      <line x1="112" y1="48" x2="112" y2="185" stroke="#C49A6C" strokeWidth="0.8" strokeDasharray="4,3"/>
      {/* Navel */}
      <ellipse cx="112" cy="155" rx="5" ry="3" fill="#C49A6C" opacity="0.5"/>
      {/* Labels */}
      <text x="112" y="75" textAnchor="middle" fontSize="8" fill="#7A5C2A" fontFamily="serif">흉부</text>
      <text x="112" y="145" textAnchor="middle" fontSize="8" fill="#7A5C2A" fontFamily="serif">복부</text>
      {/* Markers */}
      {pts.map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="11" fill={color} stroke={dark?"#999":"white"} strokeWidth="2" opacity="0.25" className="pm"/>
          <circle cx={cx} cy={cy} r="7.5" fill={color} stroke={dark?"#888":"white"} strokeWidth="1.5" className="pm" style={{animationDelay:`${i*0.3}s`}}/>
          <circle cx={cx} cy={cy} r="3" fill={dark?"#666":"white"}/>
        </g>
      ))}
    </svg>
  );
}

function FootSVG({ toe, color }) {
  const leftFoot = toe === "leftBig";
  const dark = color === "#E8E8E8" || color === "#D0D0D0" || color === "#FFFACD" || color === "#FFFDD0";
  const [mx, my] = leftFoot ? [52, 36] : [108, 44];
  return (
    <svg viewBox="0 0 160 180" className="w-full max-w-[140px]">
      <defs>
        <linearGradient id="foot" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDDCB5"/>
          <stop offset="100%" stopColor="#F0C08A"/>
        </linearGradient>
      </defs>
      {/* Foot body */}
      {leftFoot
        ? <path d="M30 170 Q20 150 22 120 Q24 80 35 55 Q45 35 65 25 Q90 15 105 20 Q118 28 115 45 Q112 62 95 68 L85 72 Q70 80 62 110 Q55 140 58 170Z" fill="url(#foot)" stroke="#D4A574" strokeWidth="1.2"/>
        : <path d="M130 170 Q140 150 138 120 Q136 80 125 55 Q115 35 95 25 Q70 15 55 20 Q42 28 45 45 Q48 62 65 68 L75 72 Q90 80 98 110 Q105 140 102 170Z" fill="url(#foot)" stroke="#D4A574" strokeWidth="1.2"/>
      }
      {/* Toes */}
      {leftFoot
        ? [[52,36,10,14],[69,30,8,12],[84,26,8,12],[98,28,7,11],[111,34,7,10]].map(([x,y,rx,ry],i)=>(
            <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="url(#foot)" stroke="#D4A574" strokeWidth="1.2"/>
          ))
        : [[108,36,10,14],[91,30,8,12],[76,26,8,12],[62,28,7,11],[49,34,7,10]].map(([x,y,rx,ry],i)=>(
            <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="url(#foot)" stroke="#D4A574" strokeWidth="1.2"/>
          ))
      }
      {/* Labels */}
      <text x={leftFoot?52:108} y={leftFoot?16:16} textAnchor="middle" fontSize="8" fill="#7A5C2A" fontFamily="serif">엄지</text>
      <text x={leftFoot?111:49} y={leftFoot?22:22} textAnchor="middle" fontSize="8" fill="#7A5C2A" fontFamily="serif">소지</text>
      {/* Marker */}
      <circle cx={mx} cy={my} r="12" fill={color} stroke={dark?"#999":"white"} strokeWidth="2" opacity="0.25" className="pm"/>
      <circle cx={mx} cy={my} r="8" fill={color} stroke={dark?"#888":"white"} strokeWidth="1.5" className="pm"/>
      <circle cx={mx} cy={my} r="3.5" fill={dark?"#666":"white"}/>
    </svg>
  );
}

function BodyDiagram({ step }) {
  const { part, finger, point, toe, c, cn, loc, locD, side, d, t } = step;
  return (
    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-4 rounded-full border-2 border-white shadow-md" style={{background:c}}/>
        <span className="text-sm font-semibold text-stone-700">{cn} 패치</span>
      </div>
      <div className="flex justify-center mb-3">
        {part === "hand" && <HandSVG finger={finger} color={c}/>}
        {part === "torso" && <TorsoSVG point={point} color={c}/>}
        {part === "foot" && <FootSVG toe={toe} color={c}/>}
        {part === "clothing" && (
          <div className="w-32 h-32 flex flex-col items-center justify-center text-5xl rounded-2xl" style={{background:c+"22",border:`2px dashed ${c}`}}>
            <span>👔</span>
            <span className="text-xs mt-1 text-stone-600 font-medium text-center">의류 착용</span>
          </div>
        )}
      </div>
      <div className="space-y-1 text-xs text-stone-600">
        <div className="flex gap-1"><span className="font-semibold text-amber-700">위치:</span><span>{loc}{locD ? ` — ${locD}` : ""}</span></div>
        <div className="flex gap-1"><span className="font-semibold text-amber-700">성별:</span><span>{side}</span></div>
        <div className="flex gap-1"><span className="font-semibold text-amber-700">효과:</span><span>{d}</span></div>
      </div>
    </div>
  );
}

/* ── LOADING SCREEN ── */
function LoadingScreen({ userName, onDone }) {
  const [msg, setMsg] = useState(0);
  const msgs = ["입태 에너지 분석 중...","출생 오행 계산 중...","음양 패턴 분석 중...","맞춤 리포트 생성 중...","분석 완료!"];
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setMsg(i);
      if (i >= msgs.length - 1) { clearInterval(id); setTimeout(onDone, 700); }
    }, 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8]">
      <div className="text-center space-y-6">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-amber-200"/>
          <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 spin"/>
          <div className="absolute inset-0 flex items-center justify-center text-3xl">☯</div>
        </div>
        <p className="text-lg font-medium text-stone-600">{msgs[msg]}</p>
        <p className="text-sm text-amber-600">{userName}님의 고유 에너지를 분석하고 있습니다</p>
        <div className="flex gap-1 justify-center">
          {msgs.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i <= msg ? "bg-amber-500" : "bg-amber-200"}`}/>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ── RING THERAPY ── */
const DorsalHandSVG = ({ side, ringFinger, ringType }) => {
  const isLeft = side === "left";
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 130" className="w-full max-w-[110px] drop-shadow-sm overflow-visible" style={{ isolation: "isolate" }}>
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#A16207" />
          </linearGradient>
          <linearGradient id="silverGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F3F4F6" />
            <stop offset="50%" stopColor="#9CA3AF" />
            <stop offset="100%" stopColor="#4B5563" />
          </linearGradient>
        </defs>
        <g transform={isLeft ? "" : "translate(100, 0) scale(-1, 1)"}>
          {/* Hand Silhouette */}
          <path d="M 23 130 L 26 80 Q 20 60 22 55 L 75 55 Q 85 75 80 130 Z" fill="#FAFAF9" stroke="#D6D3D1" strokeWidth="1.5" />
          {/* Thumb */}
          <path d="M 75 75 Q 98 60 92 48 Q 85 42 70 65" fill="#FAFAF9" stroke="#D6D3D1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Pinky */}
          <rect x="14" y="45" width="13" height="40" rx="6.5" fill="#FAFAF9" stroke="#D6D3D1" strokeWidth="1.5"/>
          {/* Ring Finger */}
          <rect x="29" y="30" width="14" height="55" rx="7" fill="#FAFAF9" stroke="#D6D3D1" strokeWidth="1.5"/>
          {/* Middle Finger */}
          <rect x="45" y="20" width="15" height="65" rx="7.5" fill="#FAFAF9" stroke="#D6D3D1" strokeWidth="1.5"/>
          {/* Index Finger */}
          <rect x="62" y="30" width="14" height="55" rx="7" fill="#FAFAF9" stroke="#D6D3D1" strokeWidth="1.5"/>
          {/* Mask overlapping lines */}
          <ellipse cx="44" cy="72" rx="32" ry="12" fill="#FAFAF9" />
          
          {/* The Ring Layer */}
          {ringFinger === "ring" && (
            <motion.rect
              x="28.5" y="55" width="15" height="5" rx="2"
              fill={`url(#${ringType}Grad)`}
              animate={{ filter: [`drop-shadow(0px 0px 1px ${ringType==="gold"?"#FDE047":"#D1D5DB"})`, `drop-shadow(0px 0px 8px ${ringType==="gold"?"#F59E0B":"#9CA3AF"})`, `drop-shadow(0px 0px 1px ${ringType==="gold"?"#FDE047":"#D1D5DB"})`] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          )}
          {ringFinger === "index" && (
            <motion.rect
              x="61.5" y="55" width="15" height="5" rx="2"
              fill={`url(#${ringType}Grad)`}
              animate={{ filter: [`drop-shadow(0px 0px 1px ${ringType==="gold"?"#FDE047":"#D1D5DB"})`, `drop-shadow(0px 0px 8px ${ringType==="gold"?"#F59E0B":"#9CA3AF"})`, `drop-shadow(0px 0px 1px ${ringType==="gold"?"#FDE047":"#D1D5DB"})`] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          )}
        </g>
      </svg>
    </div>
  );
};

const RingTherapy = ({ report }) => {
  const el = report.element; // "木", "火", "金", "水"
  const isWoodFire = el === "木" || el === "火";
  const typeText = el === "木" ? "목형" : el === "火" ? "화형" : el === "金" ? "금형" : el === "水" ? "수형" : "토형";

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-stone-800 mb-1">💍 VVIP 골드/실버 테라피</h3>
        <p className="text-sm text-stone-500">
          <strong className="text-amber-600">[{typeText}]</strong> 오행 맞춤 기력 증진 반지 처방
        </p>
      </div>

      <div className="flex justify-center items-end gap-1 mb-6 w-full">
        {/* Left Hand */}
        <div className="flex-1 max-w-[130px]">
          <DorsalHandSVG 
            side="left" 
            ringFinger={isWoodFire ? "index" : "ring"} 
            ringType={isWoodFire ? "silver" : "gold"} 
          />
        </div>
        {/* Right Hand */}
        <div className="flex-1 max-w-[130px]">
          <DorsalHandSVG 
            side="right" 
            ringFinger={isWoodFire ? "ring" : "index"} 
            ringType={isWoodFire ? "gold" : "silver"} 
          />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 text-center border border-amber-100 shadow-sm w-full">
        <p className="text-sm font-semibold text-stone-700 leading-relaxed">
          {typeText} 맞춤 착용 위치:<br/>
          <span className="text-amber-600 block mt-1 text-base">
            {isWoodFire 
              ? "좌수 2지(검지) 은반지 / 우수 4지(약지) 금반지" 
              : "좌수 4지(약지) 금반지 / 우수 2지(검지) 은반지"}
          </span>
        </p>
        <p className="text-xs text-stone-500 mt-3 break-keep">
          지정된 손가락에 반지를 착용하면 미세한 파장이 경혈을 자극하여 신체의 에너지를 보충합니다.
        </p>
      </div>
    </div>
  );
};

/* ── MAIN APP ── */
export default function App() {
  useEffect(() => { injectCSS(); }, []);

  const [screen, setScreen] = useState("landing"); // landing | quiz | loading | results
  const [landingOut, setLandingOut] = useState(false);
  const [step, setStep] = useState(0); // 0=Q1, 1-8=fake, 9=Q10
  const [userData, setUserData] = useState({ name:"", gender:"female", year:"1990", month:"5", day:"15", lunar:false });
  const [fakeAns, setFakeAns] = useState([]);
  const [q10, setQ10] = useState(null);
  const [report, setReport] = useState(null);
  const [unlockStatus, setUnlockStatus] = useState('locked'); // 'locked', 'step1_unlocked', 'all_unlocked'
  const [paying, setPaying] = useState(null);

  const startQuiz = () => {
    setLandingOut(true);
    setTimeout(() => { setScreen("quiz"); setStep(0); setLandingOut(false); }, 650);
  };
  const nextStep = () => {
    if (step < 9) setStep(s => s+1);
    else {
      // Determine body type
      const { year, month, day, lunar } = userData;
      const lm = lunar ? parseInt(month) : approxLunarMonth(parseInt(year), parseInt(month), parseInt(day));
      const key = getBodyType(lm, q10 || 3);
      setReport(REPORTS[key]);
      setScreen("loading");
    }
  };
  const handlePay = async (type) => {
    setPaying(type);
    await new Promise(r => setTimeout(r, 1500));
    if (type === 'all' || type === 'step2') setUnlockStatus('all_unlocked');
    else if (type === 'step1') setUnlockStatus('step1_unlocked');
    setPaying(null);
  };

  /* LANDING */
  if (screen === "landing") return (
    <div className={`relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-6 py-10 ${landingOut ? "landing-fade-out" : "screen-fade-in"}`}
      style={{background:"linear-gradient(170deg,#DFF0EC 0%,#EBF5F2 40%,#F0F7F5 70%,#E8F2EF 100%)"}}>

      {/* ── Subtle background texture ── */}
      <div className="pointer-events-none absolute inset-0"
        style={{background:"radial-gradient(ellipse 80% 60% at 50% 30%, rgba(82,183,157,0.08) 0%, transparent 70%)"}}/>

      {/* ── Main yin-yang orb + orbit ── */}
      <div className="relative flex items-center justify-center mb-10" style={{width:220,height:220}}>

        {/* Glow aura rings */}
        <div className="absolute rounded-full circle-glow" style={{width:210,height:210,background:"rgba(82,183,157,0.06)",border:"1px solid rgba(82,183,157,0.12)"}}/>
        <div className="absolute rounded-full" style={{width:182,height:182,background:"rgba(82,183,157,0.10)",border:"1px solid rgba(82,183,157,0.18)"}}/>

        {/* Main circle */}
        <div className="absolute rounded-full flex items-center justify-center shadow-2xl" style={{
          width:158,height:158,
          background:"radial-gradient(135deg at 35% 35%,#5BA89A 0%,#2D7A72 45%,#1C5C58 100%)",
          boxShadow:"0 12px 48px rgba(29,92,88,0.38),0 2px 8px rgba(29,92,88,0.18)"
        }}>
          {/* Yin-yang SVG — very slowly rotates */}
          <div className="yin-rotate">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="38" fill="#1C3A38"/>
              {/* left half white */}
              <path d="M40 2 A38 38 0 0 0 40 78 A19 19 0 0 0 40 40 A19 19 0 0 1 40 2 Z" fill="#F0F0E8"/>
              {/* small circles */}
              <circle cx="40" cy="21" r="9.5" fill="#F0F0E8"/>
              <circle cx="40" cy="59" r="9.5" fill="#1C3A38"/>
              <circle cx="40" cy="21" r="3.5" fill="#1C3A38"/>
              <circle cx="40" cy="59" r="3.5" fill="#F0F0E8"/>
            </svg>
          </div>
        </div>

        {/* Orbiting golden dot */}
        <div className="absolute" style={{width:0,height:0,top:"50%",left:"50%"}}>
          <div className="orbit-dot" style={{
            width:14,height:14,borderRadius:"50%",
            marginTop:-7,marginLeft:-7,
            background:"radial-gradient(circle at 35% 35%,#F5D06E,#C8961A)",
            boxShadow:"0 0 8px 3px rgba(210,158,30,0.55)",
          }}/>
        </div>
      </div>

      {/* ── Text content ── */}
      <div className="relative z-10 max-w-sm w-full text-center space-y-5">

        {/* Tag pill */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium"
          style={{background:"rgba(82,183,157,0.15)",color:"#2D7A6E",border:"1px solid rgba(82,183,157,0.3)"}}>
          🌿 오행 에너지 × 색채 요법
        </div>

        {/* Main title */}
        <h1 className="text-[1.95rem] leading-snug font-bold" style={{color:"#1E3A38",fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif",letterSpacing:"-0.02em"}}>
          당신의 영혼은<br/>어떤 색으로 빛나고 있나요?
        </h1>

        {/* Subtitles */}
        <div className="space-y-1 px-1">
          <p className="text-sm leading-relaxed" style={{color:"#3A5E5A"}}>
            태어난 순간의 우주적 에너지와 현재의 심리 주파수를 분석해,<br/>
            나를 치유할 <span className="font-semibold" style={{color:"#2D7A6E"}}>퍼스널 자기 색(Self-Color)</span>을 찾아드립니다.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-stretch justify-center gap-0 py-2">
          {[
            {v:"8가지",l:"체질 유형",c:"#2D7A6E"},
            {v:"100%",l:"개인 맞춤",c:"#C8961A"},
            {v:"FREE",l:"기본 결과",c:"#2D7A6E"},
          ].map((s,i)=>(
            <div key={i} className="flex-1 flex flex-col items-center py-1">
              <span className="text-xl font-bold" style={{color:s.c,fontFamily:"'Noto Sans KR',sans-serif"}}>{s.v}</span>
              <span className="text-xs mt-0.5" style={{color:"#7A9E9A"}}>{s.l}</span>
              {i<2 && <div className="absolute" style={{display:"none"}}/>}
            </div>
          )).reduce((acc,el,i)=>
            i===0 ? [el] : [...acc,
              <div key={`div${i}`} className="w-px self-stretch my-1" style={{background:"rgba(82,183,157,0.3)"}}/>,
              el
            ], []
          )}
        </div>

        {/* CTA Button */}
        <button onClick={startQuiz}
          className="w-full py-4 rounded-full font-bold text-base text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0"
          style={{
            background:"linear-gradient(135deg,#C8961A 0%,#E2B040 40%,#C8961A 100%)",
            boxShadow:"0 6px 24px rgba(180,140,30,0.45)",
            fontFamily:"'Noto Sans KR',sans-serif",
            letterSpacing:"0.04em",
          }}>
          ✦ 무료 테스트 시작하기
        </button>

        {/* Bottom info */}
        <div className="flex justify-center gap-4 text-xs" style={{color:"#8AADAA"}}>
          <span>⏱ 2분 소요</span>
          <span>🔒 개인정보 보호</span>
          <span>🎁 무료 기본 결과</span>
        </div>
      </div>
    </div>
  );

  /* LOADING */
  if (screen === "loading") return <LoadingScreen userName={userData.name||"고객"} onDone={() => setScreen("results")}/>;

  /* QUIZ */
  if (screen === "quiz") {
    const total = 10;
    const pct = ((step+1)/total*100).toFixed(0);
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col">
        {/* Progress */}
        <div className="px-4 pt-6 pb-2">
          <div className="max-w-lg mx-auto">
            <div className="flex justify-between text-xs text-stone-400 mb-1">
              <span>Q{step+1} / {total}</span><span>{pct}% 완료</span>
            </div>
            <div className="h-1.5 bg-amber-100 rounded-full">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{width:`${pct}%`}}/>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-start justify-center px-4 py-6">
          <div className="max-w-lg w-full fiu">
            {/* Q1 */}
            {step === 0 && (
              <div className="space-y-5">
                <div className="text-center mb-6">
                  <div className="text-3xl mb-2">📋</div>
                  <h2 className="text-xl font-bold text-stone-800">기본 정보 입력</h2>
                  <p className="text-sm text-stone-500 mt-1">정확한 분석을 위해 생년월일을 입력해주세요</p>
                </div>
                {[["이름",<input key="n" value={userData.name} onChange={e=>setUserData(u=>({...u,name:e.target.value}))} placeholder="홍길동" className="w-full border border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 bg-white"/>],
                  ["성별",<div key="g" className="flex gap-2">{["female","male"].map(g=><button key={g} onClick={()=>setUserData(u=>({...u,gender:g}))} className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${userData.gender===g?"border-amber-500 bg-amber-50 text-amber-700":"border-stone-200 bg-white text-stone-600"}`}>{g==="female"?"👩 여성":"👨 남성"}</button>)}</div>],
                  ["생년월일",<div key="d" className="flex gap-2">{[["year","년",4],["month","월",2],["day","일",2]].map(([k,l,ml])=><div key={k} className="flex-1"><input type="number" value={userData[k]} onChange={e=>setUserData(u=>({...u,[k]:e.target.value}))} placeholder={l} maxLength={ml} className="w-full border border-amber-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-amber-400 bg-white text-center"/></div>)}</div>],
                  ["",<div key="cal" className="flex items-center gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100"><span className="text-xs text-stone-600 flex-1">위 날짜는</span><button onClick={()=>setUserData(u=>({...u,lunar:false}))} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!userData.lunar?"bg-amber-500 text-white":"bg-white text-stone-500 border border-stone-200"}`}>양력</button><button onClick={()=>setUserData(u=>({...u,lunar:true}))} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${userData.lunar?"bg-amber-500 text-white":"bg-white text-stone-500 border border-stone-200"}`}>음력</button><span className="text-xs text-stone-400">입니다</span></div>]
                ].map(([l,el])=>(
                  <div key={l}>
                    {l && <label className="text-sm font-semibold text-stone-700 mb-1.5 block">{l}</label>}
                    {el}
                  </div>
                ))}
                <button onClick={nextStep} disabled={!userData.name||!userData.year||!userData.month||!userData.day}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-4 rounded-2xl text-sm transition-all mt-4">
                  다음 →
                </button>
              </div>
            )}
            {/* Fake Q2~9 */}
            {step >= 1 && step <= 8 && (() => {
              const fq = FQS[step - 1];
              return (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="text-3xl mb-2">🧩</div>
                    <h2 className="text-lg font-bold text-stone-800">{fq.q}</h2>
                    <p className="text-xs text-stone-400 mt-1">직감적으로 느껴지는 대로 선택해주세요</p>
                  </div>
                  <div className="space-y-2">
                    {fq.opts.map((o, i) => (
                      <button key={i} onClick={() => { setFakeAns(a => [...a, i]); nextStep(); }}
                        className="w-full text-left px-4 py-3.5 rounded-2xl border-2 border-amber-100 bg-white hover:border-amber-400 hover:bg-amber-50 text-sm text-stone-700 transition-all font-medium">
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
            {/* Q10 */}
            {step === 9 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="text-3xl mb-2">☯️</div>
                  <h2 className="text-lg font-bold text-stone-800">평소 당신의 에너지 방식은?</h2>
                  <p className="text-xs text-stone-400 mt-1">가장 솔직하게, 평소 자신의 모습을 선택해주세요</p>
                </div>
                <div className="space-y-2">
                  {Q10_OPTS.map((o, i) => (
                    <button key={i} onClick={() => setQ10(o.v)}
                      className={`w-full text-left px-4 py-4 rounded-2xl border-2 text-sm font-medium transition-all ${q10===o.v?"border-amber-500 bg-amber-50 text-amber-700":"border-amber-100 bg-white text-stone-700 hover:border-amber-300"}`}>
                      {o.l}
                    </button>
                  ))}
                </div>
                <button onClick={nextStep} disabled={!q10}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-sm transition-all mt-2">
                  ✨ 분석 시작하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* RESULTS */
  if (screen === "results" && report) {
    const r = report;
    return (
      <div className="min-h-screen bg-[#FDFCF8]">
        {/* Header */}
        <div className="bg-gradient-to-br from-stone-800 via-stone-700 to-amber-900 text-white px-4 py-10 text-center">
          <div className="max-w-lg mx-auto">
            <p className="text-amber-300 text-xs tracking-widest uppercase mb-2">AI 에너지 분석 리포트</p>
            <h1 className="text-2xl font-bold mb-1">{userData.name || "고객"}님만을 위한</h1>
            <div className="gs text-xl font-bold mb-4">{r.title}</div>
            <div className="bg-white/10 rounded-2xl p-4 inline-block">
              <div className="text-4xl mb-1">{r.elemoji}</div>
              <p className="text-amber-200 text-sm font-medium">{r.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

          {/* ── FREE TIER ── */}
          <section className="fiu bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="bg-amber-50 px-5 py-3 border-b border-amber-100 flex items-center gap-2">
              <span className="text-lg">🆓</span>
              <span className="font-bold text-stone-700 text-sm">선천적 에너지 & 정서 지도</span>
              <span className="ml-auto bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">무료</span>
            </div>
            <div className="p-5 space-y-5">
              {/* Engine & Fuel */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {icon:"⚙️",label:"엔진 (出生)",val:r.engineSeason,desc:"당신을 움직이는 동력"},
                  {icon:"⛽",label:"연료 (入胎)",val:r.fuelSeason,desc:"엔진을 채우는 원천"},
                ].map(x=>(
                  <div key={x.label} className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <div className="text-xl mb-1">{x.icon}</div>
                    <div className="text-xs text-amber-700 font-semibold">{x.label}</div>
                    <div className="text-xs text-stone-700 font-medium mt-0.5">{x.val}</div>
                    <div className="text-xs text-stone-400 mt-0.5">{x.desc}</div>
                  </div>
                ))}
              </div>
              {/* Engine desc */}
              <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-xl p-4 border border-stone-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">⚙️</span>
                  <span className="text-sm font-bold text-stone-700">불타오르는 엔진</span>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">{r.engineDesc}</p>
              </div>
              <div className="bg-gradient-to-br from-stone-50 to-blue-50 rounded-xl p-4 border border-stone-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">⛽</span>
                  <span className="text-sm font-bold text-stone-700">결핍된 연료</span>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">{r.fuelDesc}</p>
              </div>
              {/* Personality */}
              <div>
                <h3 className="text-sm font-bold text-stone-700 mb-2 flex items-center gap-1"><span>🧬</span> 기본 성향</h3>
                <p className="text-sm text-stone-600 leading-relaxed bg-stone-50 rounded-xl p-3">{r.personality}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <h3 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-1"><span>⚠️</span> 건강 척도 & 감정 변화</h3>
                <p className="text-sm text-red-600 leading-relaxed">{r.emotionWarn}</p>
              </div>
            </div>
          </section>

          {/* ── HIGHLIGHTED ALL-UNLOCK CTA ── */}
          {unlockStatus === 'locked' && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-8 mb-4 relative z-10"
            >
              {/* Badge */}
              <div className="absolute -top-3 right-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-red-400 rotate-3 z-20 pm" style={{ animationDuration: '3s' }}>
                🔥 10% 할인
              </div>

              <div className="w-full relative group overflow-hidden bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 rounded-2xl p-4 shadow-xl transition-all duration-300">
                {/* Pulse animation effect on background */}
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 pm bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                
                <div className="relative z-10 flex flex-col items-center justify-center mb-3">
                  <div className="text-white font-bold text-lg drop-shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👑</span>
                      <span><span className="text-white/70 line-through text-sm font-medium mr-1">$2.00</span> $1.80 결제하고 VVIP 프리미엄 전체 잠금해제</span>
                    </div>
                  </div>
                  <div className="text-pink-100 text-xs mt-1.5 font-medium tracking-wide">모든 진단과 시각화 테라피를 한 번에 오픈하세요!</div>
                </div>

                <div className="relative z-20 px-4">
                  <PayPalButtons 
                    style={{ layout: "vertical", color: "gold", shape: "pill", label: "checkout", height: 45 }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [{ amount: { value: "1.80" }, description: "VVIP Premium Unlock" }]
                      });
                    }}
                    onApprove={(data, actions) => {
                      return actions.order.capture().then(() => {
                        setUnlockStatus('all_unlocked');
                      });
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── $1 TIER ── */}
          <section className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3 border-b border-emerald-100 flex items-center gap-2">
              <span className="text-lg">💊</span>
              <span className="font-bold text-stone-700 text-sm"><Tip k="미병">미병(未病)</Tip> 진단 & 맞춤 처방전</span>
              {unlockStatus !== 'locked'
                ? <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">✅ 잠금 해제</span>
                : <span className="ml-auto bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">🔒 잠김</span>
              }
            </div>
            <div className={`p-5 space-y-5 ${unlockStatus === 'locked' ? "blur-sm-custom pointer-events-none" : ""}`}>
              {/* Symptoms */}
              <div>
                <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-1"><span>🔍</span> 체질적 약점 심층 진단</h3>
                <div className="space-y-3">
                  {r.symptoms.map((s, i) => (
                    <div key={i} className="flex gap-3 bg-stone-50 rounded-xl p-3 border border-stone-100">
                      <span className="text-2xl">{s.i}</span>
                      <div>
                        <div className="text-sm font-semibold text-stone-700">{s.t}</div>
                        <div className="text-xs text-stone-500 mt-0.5 leading-relaxed">{s.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Diet */}
              <div>
                <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-1"><span>🍽️</span> 정밀 식단 처방</h3>
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 mb-2">
                  <div className="text-xs font-bold text-amber-700 mb-1">핵심 맛: {r.keyTaste}</div>
                  <p className="text-xs text-stone-600">{r.keyTasteDesc}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-100 mb-2">
                  <div className="text-xs font-bold text-green-700 mb-2">✅ 강력 추천 식품</div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.rec.map(f => <span key={f} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-lg">{f}</span>)}
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                  <div className="text-xs font-bold text-red-700 mb-2">🚫 절대 금기 식품</div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.avoid.map(f => <span key={f} className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-lg line-through">{f}</span>)}
                  </div>
                </div>
              </div>
              {/* Exercise */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h3 className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-1"><span>🏃</span> 맞춤 운동 프로토콜</h3>
                <p className="text-sm text-blue-700 leading-relaxed">{r.exercise}</p>
              </div>
            </div>
            {unlockStatus === 'locked' && (
              <div className="px-5 pb-5">
                <div className="w-full bg-stone-800 rounded-2xl p-4 shadow-md">
                  <div className="text-center text-white font-bold text-sm mb-3">
                    💳 $1 결제하고 미병 진단 보기
                  </div>
                  <PayPalButtons 
                    style={{ layout: "vertical", color: "white", shape: "pill", label: "checkout", height: 40 }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [{ amount: { value: "1.00" }, description: "Basic Mibyeong Diagnosis" }]
                      });
                    }}
                    onApprove={(data, actions) => {
                      return actions.order.capture().then(() => {
                        setUnlockStatus('step1_unlocked');
                      });
                    }}
                  />
                </div>
                <p className="text-center text-xs text-stone-400 mt-2">안전한 PayPal 결제</p>
              </div>
            )}
          </section>

          {/* ── $3 TIER ── */}
          <section className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-3 border-b border-purple-100 flex items-center gap-2">
              <span className="text-lg">👑</span>
              <span className="font-bold text-stone-700 text-sm">VVIP 시각화 색채 요법</span>
              {unlockStatus === 'all_unlocked'
                ? <span className="ml-auto bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">✅ 잠금 해제</span>
                : <span className="ml-auto bg-stone-100 text-stone-500 text-xs px-2 py-0.5 rounded-full font-medium">🔒 잠김</span>
              }
            </div>
            <div className={`p-5 space-y-5 ${unlockStatus !== 'all_unlocked' ? "blur-sm-custom pointer-events-none" : ""}`}>
              {/* Color intro — auto text contrast */}
              {(() => {
                const light = isLightColor(r.color);
                const textMain  = light ? "#1A1A1A" : "#FFFFFF";
                const textSub   = light ? "#3A3A3A" : "rgba(255,255,255,0.88)";
                const textMuted = light ? "#555555" : "rgba(255,255,255,0.72)";
                const dotBorder = light ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.5)";
                const bgFrom = r.color + (light ? "CC" : "DD");
                const bgTo   = r.color + (light ? "77" : "88");
                return (
                  <div className="rounded-2xl p-5 shadow-md" style={{background:`linear-gradient(135deg, ${bgFrom}, ${bgTo})`}}>
                    <div className="text-xl mb-2 font-bold" style={{color:textMain}}>{r.colorName}</div>
                    <p className="text-sm leading-relaxed" style={{color:textSub}}>{r.colorDesc}</p>
                    <div className="mt-4 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full shadow-lg flex-shrink-0"
                        style={{background:r.color, border:`3px solid ${dotBorder}`}}/>
                      <span className="text-xs font-medium" style={{color:textMuted}}>당신의 핵심 치유 파장</span>
                    </div>
                  </div>
                );
              })()}
              {/* Science note */}
              <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 text-xs text-indigo-700 leading-relaxed">
                인체는 미세한 파장에 반응하는 에너지체입니다. 고유의 <strong>자기 색(Self-Color)</strong>을 경혈(<Tip k="복모혈">복모혈</Tip>)에 부착하는 것은, 부족한 <Tip k="정기">정기(正氣)</Tip>를 강하게 채워 <Tip k="사기">사기(邪氣)</Tip>를 스스로 물리치게 만드는 가장 고차원적인 웰니스 실천법입니다.
              </div>
              {/* Steps */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-stone-700 flex items-center gap-1"><span>📍</span> 패치 부착 위치 시각화 가이드</h3>
                {r.steps.map(s => (
                  <div key={s.n} className="rounded-2xl border border-stone-100 overflow-hidden">
                    <div className="bg-stone-50 px-4 py-2.5 flex items-center gap-2 border-b border-stone-100">
                      <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">{s.n}</div>
                      <span className="text-sm font-bold text-stone-700">{s.t}</span>
                    </div>
                    <div className="p-4">
                      <BodyDiagram step={s}/>
                    </div>
                  </div>
                ))}
              </div>
              {/* Emergency */}
              <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                <h3 className="text-sm font-bold text-rose-700 mb-3 flex items-center gap-1"><span>🚨</span> [VVIP 전용] 증상별 응급 프로토콜</h3>
                <div className="space-y-2">
                  {r.emg.map((e,i) => (
                    <div key={i} className="bg-white rounded-xl p-3 border border-rose-100 text-xs">
                      <div className="font-semibold text-stone-700">{e.s}</div>
                      <div className="text-rose-600 mt-0.5">→ <strong>{e.c}</strong> 파장을 <span className="text-stone-500">{e.l}</span>에 부착</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 bg-yellow-50 rounded-xl p-2 border border-yellow-100 text-xs text-yellow-700">
                  ⚠️ 주의: 한 가지 색상을 신체 3곳 이상에 동시에 부착하면 어지러움이 생길 수 있습니다. 밸런스를 유지하세요.
                </div>
              </div>
            </div>
            {unlockStatus === 'step1_unlocked' && (
              <div className="px-5 pb-5 mt-2 relative z-10">
                <div className="w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 shadow-md">
                  <div className="text-center text-white font-bold text-sm mb-3">
                    💎 $1 더 결제하고 VVIP 프리미엄 테라피 가이드 보기
                  </div>
                  <PayPalButtons 
                    style={{ layout: "vertical", color: "white", shape: "pill", label: "checkout", height: 40 }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [{ amount: { value: "1.00" }, description: "VVIP Premium Upgrade" }]
                      });
                    }}
                    onApprove={(data, actions) => {
                      return actions.order.capture().then(() => {
                        setUnlockStatus('all_unlocked');
                      });
                    }}
                  />
                </div>
                <p className="text-center text-xs text-stone-400 mt-2">안전한 PayPal 결제</p>
              </div>
            )}
          </section>

          {/* ── $3 VVIP TIER ── */}
          <section className="bg-gradient-to-br from-amber-50 to-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden relative mt-6">
            <div className="bg-gradient-to-r from-amber-200 to-yellow-200 px-5 py-3 border-b border-amber-300 flex items-center gap-2">
              <span className="text-lg">👑</span>
              <span className="font-bold text-stone-800 text-sm">VVIP 전용 프리미엄 테라피</span>
              {unlockStatus === 'all_unlocked'
                ? <span className="ml-auto bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">✅ 잠금 해제</span>
                : <span className="ml-auto bg-stone-100 text-stone-500 text-xs px-2 py-0.5 rounded-full font-medium">🔒 잠김</span>
              }
            </div>
            <div className={`p-5 ${unlockStatus !== 'all_unlocked' ? "blur-sm-custom pointer-events-none" : ""}`}>
              <RingTherapy report={r} />
            </div>
          </section>

          {/* Reset */}
          <div className="text-center pb-8">
            <button onClick={() => { setScreen("landing"); setStep(0); setFakeAns([]); setQ10(null); setReport(null); setUnlockStatus('locked'); }}
              className="text-sm text-stone-400 hover:text-amber-600 transition-colors underline">
              처음부터 다시 분석하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
