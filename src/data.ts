export interface Peak {
  id: string;
  nameCH: string;
  nameEN: string;
  height: number; // in meters
  grade: "Class A" | "Class B" | "Class C" | "Class C+" | "Class D"; // difficulty grade
  range: "Yushan Range" | "Hsuehshan Range" | "Central Range" | "Alishan Range" | "Coastal Range" | "Other";
  location: string;
  durationDays: number;
  permitRequired: boolean;
  latitude: number;
  longitude: number;
  description: string;
  tips: string[];
  pointsOfInterest: { name: string; elevation: number }[];
  trailPath: { lat: number; lng: number; ele: number }[]; // Simulated hiking trail trailpoints
}

// Generates smooth hiking tracks from a trailhead to the mountain peak
function generateTrail(startLat: number, startLng: number, peakLat: number, peakLng: number, startEle: number, peakEle: number, steps: number = 10) {
  const path = [];
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    // Add custom noise/wiggle to make it look like a real winding mountain trail
    const segmentWiggleLat = Math.sin(ratio * Math.PI * 3) * 0.002;
    const segmentWiggleLng = Math.cos(ratio * Math.PI * 3) * 0.002;
    path.push({
      lat: startLat + (peakLat - startLat) * ratio + segmentWiggleLat,
      lng: startLng + (peakLng - startLng) * ratio + segmentWiggleLng,
      ele: Math.round(startEle + (peakEle - startEle) * Math.sin(ratio * (Math.PI / 2))), // Nonlinear altitude curve
    });
  }
  return path;
}

export const TAIWAN_100_PEAKS: Peak[] = [
  {
    id: "yushan-main",
    nameCH: "玉山主峰",
    nameEN: "Yushan Main Peak (Mt. Jade)",
    height: 3952,
    grade: "Class A",
    range: "Yushan Range",
    location: "Nantou / Chiayi / Kaohsiung",
    durationDays: 2,
    permitRequired: true,
    latitude: 23.4705,
    longitude: 120.9576,
    description: "The highest mountain in Taiwan and Northeast Asia. Revered by the local Bunun and Tsou Indigenous tribes. Features spectacular alpine landscapes and well-maintained standard trails.",
    tips: [
      "Paiyun Lodge (3,402m) requires pre-registration for draw entry.",
      "Early morning summit is advised to watch the sunrise and avoid cloud fog.",
      "Windy and low temperature conditions exist near the summit chain passage."
    ],
    pointsOfInterest: [
      { name: "Tataka Trailhead", elevation: 2610 },
      { name: "Monroe Pavilion", elevation: 2753 },
      { name: "Paiyun Lodge", elevation: 3402 },
      { name: "Wind tunnel (Chain crossing)", elevation: 3860 },
      { name: "Yushan Main Peak Summit", elevation: 3952 }
    ],
    trailPath: generateTrail(23.4839, 120.8975, 23.4705, 120.9576, 2610, 3952, 18)
  },
  {
    id: "hsuehshan-main",
    nameCH: "雪山主峰",
    nameEN: "Hsuehshan Main Peak",
    height: 3886,
    grade: "Class A",
    range: "Hsuehshan Range",
    location: "Taichung / Miaoli",
    durationDays: 2,
    permitRequired: true,
    latitude: 24.3852,
    longitude: 121.2338,
    description: "The second-highest mountain in Taiwan. Renowned for its unique botanical scenery, the Black Forest (Taiwan fir trees), and the grand glacial cirque (coomb) below the peak.",
    tips: [
      "Sanliujiu (369) Cabin requires booking and permits.",
      "Take caution on the 'Crying Slope' due to steep boulder elevation.",
      "The Black Forest section can easily cause path confusion in heavy mist or snow."
    ],
    pointsOfInterest: [
      { name: "Shei-Pa Wuling Trailhead", elevation: 2140 },
      { name: "Qika Cabin", elevation: 2460 },
      { name: "Crying Slope", elevation: 3000 },
      { name: "East Peak Peak", elevation: 3201 },
      { name: "369 Cabin Site", elevation: 3150 },
      { name: "Glacial Cirque Viewpoint", elevation: 3580 },
      { name: "Hsuehshan Summit", elevation: 3886 }
    ],
    trailPath: generateTrail(24.4223, 121.2982, 24.3852, 121.2338, 2140, 3886, 20)
  },
  {
    id: "nanhu-main",
    nameCH: "南湖大山",
    nameEN: "Nanhu Mountain",
    height: 3742,
    grade: "Class C",
    range: "Central Range",
    location: "Taichung / Yilan / Hualien",
    durationDays: 4,
    permitRequired: true,
    latitude: 24.3683,
    longitude: 121.4394,
    description: "Referred to as the 'Emperor of the Central Range'. Famous for its massive glacial valley structure, diverse endemic species, alpine junipers, and high-degree physical challenge.",
    tips: [
      "Demands high cardiovascular fitness and mountain exposure experience.",
      "Nanhu Cabin sits within a majestic glacial cirque between North and Main peaks.",
      "The Mount Wuyan Ridge crossing has exposed windward ledges requiring safety chains."
    ],
    pointsOfInterest: [
      { name: "Siyuan Trailhead", elevation: 1940 },
      { name: "Duo jia tun Peak", elevation: 2715 },
      { name: "Yunba Cabin", elevation: 2795 },
      { name: "Shenma Peak", elevation: 3141 },
      { name: "Wuyan Ridge", elevation: 3530 },
      { name: "Nanhu Cabin", elevation: 3380 },
      { name: "Nanhu Main Peak Summit", elevation: 3742 }
    ],
    trailPath: generateTrail(24.3986, 121.3653, 24.3683, 121.4394, 1940, 3742, 20)
  },
  {
    id: "dabajian",
    nameCH: "大霸尖山",
    nameEN: "Dabajianshan Peak",
    height: 3492,
    grade: "Class B",
    range: "Hsuehshan Range",
    location: "Hsinchu / Miaoli",
    durationDays: 3,
    permitRequired: true,
    latitude: 24.4614,
    longitude: 121.2568,
    description: "A legendary barrel-shaped gravel peak known as the 'Holy Peak'. Highly sacred to the indigenous Atayal and Saisiyat peoples. Climbing the barrel structure itself is now restricted to protect the geology.",
    tips: [
      "Access relies on walking the 19km Dalu Forest Road.",
      "Spectacular views of the Holy Ridgeline are visible.",
      "Jiujiu Cabin (8,806ft) provides beds and meals for hikers."
    ],
    pointsOfInterest: [
      { name: "Dalu Forest Road trail start", elevation: 2050 },
      { name: "Jiujiu Cabin", elevation: 2690 },
      { name: "Daba Base Ring Edge", elevation: 3380 },
      { name: "Xiaobajianshan", elevation: 3418 },
      { name: "Dabajianshan Summit Look", elevation: 3492 }
    ],
    trailPath: generateTrail(24.5126, 121.1895, 24.4614, 121.2568, 2050, 3492, 16)
  },
  {
    id: "hehuan-main",
    nameCH: "合歡主峰",
    nameEN: "Hehuanshan Main Peak",
    height: 3417,
    grade: "Class A",
    range: "Central Range",
    location: "Nantou / Hualien",
    durationDays: 1,
    permitRequired: false,
    latitude: 24.1378,
    longitude: 121.2721,
    description: "The most accessible of Taiwan's 100 Peaks. Accessible near the Provincial Highway 14A. Popular for high alpine grasslands, sunset photography, winter snow watching, and beginners.",
    tips: [
      "Extremely family friendly with broad, well-paved trails.",
      "Check highway traffic since Wuling gets crowded during snow seasons.",
      "Be prepared for rapid temperature drops despite warm valley weather."
    ],
    pointsOfInterest: [
      { name: "Highway 14A Trailhead", elevation: 3180 },
      { name: "Observation Deck", elevation: 3310 },
      { name: "Hehuanshan Summit Marker", elevation: 3417 }
    ],
    trailPath: generateTrail(24.1432, 121.2715, 24.1378, 121.2721, 3180, 3417, 8)
  },
  {
    id: "qilai-north",
    nameCH: "奇萊北峰",
    nameEN: "Qilai North Peak",
    height: 3607,
    grade: "Class C+",
    range: "Central Range",
    location: "Hualien / Nantou",
    durationDays: 3,
    permitRequired: true,
    latitude: 24.1186,
    longitude: 121.3282,
    description: "Known historically as the 'Black Qilai' due to its dark schist face, sheer drops, and sudden alpine weather shifts. Very majestic towering slate peak offering challenging scree climbs.",
    tips: [
      "Prone to sudden alpine dense fog and thunderstorm isolation.",
      "Requires helmet and secure climbing harness on near-vertical guide ropes.",
      "Summit view provides amazing panoramas of Central Range and Taroko Gorge."
    ],
    pointsOfInterest: [
      { name: "Hehuan Cabin Trailhead", elevation: 3120 },
      { name: "Qilai Cabin", elevation: 3320 },
      { name: "Main-North Ridge Fork", elevation: 3410 },
      { name: "North Peak Scree Face", elevation: 3490 },
      { name: "Qilai North Peak Summit", elevation: 3607 }
    ],
    trailPath: generateTrail(24.1430, 121.2850, 24.1186, 121.3282, 3120, 3607, 15)
  },
  {
    id: "xiuguluan",
    nameCH: "秀姑巒山",
    nameEN: "Xiuguluan Mountain",
    height: 3825,
    grade: "Class C",
    range: "Central Range",
    location: "Hualien / Nantou",
    durationDays: 5,
    permitRequired: true,
    latitude: 23.4942,
    longitude: 121.0594,
    description: "The highest summit of the Central Range. Set in the heart of Yushan National Park. Surrounded by rugged valleys, centuries-old juniper forests, and majestic high altitude tundra.",
    tips: [
      "Usually conquered via the multi-day South Section 2 or Batongguan historical road.",
      "Extremely remote. Rescue responses require substantial weather windows.",
      "Verify water availability at high mountain cabins."
    ],
    pointsOfInterest: [
      { name: "Dongpu Trailhead", elevation: 1120 },
      { name: "Guan gao Lodge", elevation: 2580 },
      { name: "Bayan Cabin", elevation: 3100 },
      { name: "Xiuguluan Base camp", elevation: 3510 },
      { name: "Xiuguluan Summit", elevation: 3825 }
    ],
    trailPath: generateTrail(23.5652, 120.9324, 23.4942, 121.0594, 1120, 3825, 25)
  },
  {
    id: "jiaming-sancha",
    nameCH: "三叉山(嘉明湖)",
    nameEN: "Sancha Mountain & Angel's Teardrop",
    height: 3496,
    grade: "Class B",
    range: "Central Range",
    location: "Taitung / Kaohsiung / Hualien",
    durationDays: 3,
    permitRequired: true,
    latitude: 23.2925,
    longitude: 121.0336,
    description: "Famed as the gateway to Jiaming Lake ('Angel's Teardrop'), an azure-colored alpine lake at 3,310m. The surrounding broad pasture-like dwarf bamboo plains of Sancha Mountain are incredibly photogenic.",
    tips: [
      "Prone to sudden low temperatures and high winds. Keep thermal clothing active.",
      "Register early for Xiangyang and Jiaming Lake cabins.",
      "Look out for local Formosan Sambar Deer feeding near the lake in twilight."
    ],
    pointsOfInterest: [
      { name: "Xiangyang Trailhead", elevation: 2312 },
      { name: "Xiangyang Cabin", elevation: 2850 },
      { name: "Xiangyang Mountain Fork", elevation: 3400 },
      { name: "Jiaming Lake Shelter", elevation: 3350 },
      { name: "Sancha Mountain Summit", elevation: 3496 },
      { name: "Jiaming Lake Bed", elevation: 3310 }
    ],
    trailPath: generateTrail(23.2642, 120.9850, 23.2925, 121.0336, 2312, 3496, 18)
  },
  {
    id: "beidawushan",
    nameCH: "北大武山",
    nameEN: "Beidawushan (Mt. North Dawu)",
    height: 3092,
    grade: "Class B",
    range: "Central Range",
    location: "Pingtung / Taitung",
    durationDays: 2,
    permitRequired: true,
    latitude: 22.6275,
    longitude: 120.7552,
    description: "The sacred mountain corresponding to the southern Paiwan and Rukai indigenous nations. Famed for its spectacular hemlock primrose forests, magical sea of clouds, and coastal sunrises.",
    tips: [
      "Kuaigu Cabin is the core checkpoint for the summit push.",
      "Path is slippery and mud-ridden; good hiking shoe traction is essential.",
      "Ensure hydration since water sources on the upper peak ridge are scarce."
    ],
    pointsOfInterest: [
      { name: "Pingtung Trailhead", elevation: 1540 },
      { name: "Kuaigu Cabin", elevation: 2150 },
      { name: "Giant Hemlock Tree", elevation: 2470 },
      { name: "Dawu Shrine Historic Site", elevation: 3020 },
      { name: "Beidawushan Summit", elevation: 3092 }
    ],
    trailPath: generateTrail(22.6315, 120.7180, 22.6275, 120.7552, 1540, 3092, 14)
  }
];

export interface SavedTrack {
  id: string;
  peakId: string;
  peakNameCH: string;
  peakNameEN: string;
  date: string;
  durationSeconds: number;
  distanceKm: number;
  elevationGained: number; // in meters
  coordinatesMatchedCount: number;
  points: { lat: number; lng: number; ele: number; timestamp: string }[];
}

export interface OfflineMapPack {
  id: string;
  region: string;
  coverage: string;
  sizeMb: number;
  downloaded: boolean;
  peaksCount: number;
}

export const OFFLINE_PACKS: OfflineMapPack[] = [
  { id: "north-main", region: "Northern Alps", coverage: "Hsuehshan, Daba Rift, Pintian, Nanhu Basin", sizeMb: 36, downloaded: false, peaksCount: 22 },
  { id: "yushan-range", region: "Yushan Ring & South Peak", coverage: "Yushan Main, East, North, Front Peak, Batongguan", sizeMb: 24, downloaded: true, peaksCount: 11 },
  { id: "central-one", region: "Hehuan & Qilai Wilderness", coverage: "Hehuanshan Main, Qilai Ridge, Bilushan, Yangtou", sizeMb: 18, downloaded: false, peaksCount: 14 },
  { id: "south-peak", region: "Southern Wilderness Peaks", coverage: "Beidawushan, Sancha Mountain, South Section 1 & 2", sizeMb: 42, downloaded: false, peaksCount: 28 },
];
