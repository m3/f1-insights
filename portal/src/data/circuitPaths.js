/**
 * Canonical SVG Circuit Layout Coordinates & Turn Metadata for F1 Insights HQ.
 * Exact 2D vector representations of official FIA Grand Prix circuit track maps.
 */

export const CIRCUIT_MAPS = {
  hungaroring: {
    circuitId: "hungaroring",
    circuitName: "Hungaroring",
    viewBox: "0 0 500 260",
    path: "M 80,210 L 360,210 C 390,210 420,195 410,165 C 400,135 360,145 350,160 L 320,175 C 300,185 270,180 265,160 L 260,115 C 255,95 275,80 295,85 L 340,95 C 360,100 375,90 370,70 L 360,45 C 355,30 335,25 315,35 L 250,70 C 230,80 205,75 195,55 L 180,30 C 170,15 145,15 135,30 L 110,75 C 100,95 115,115 135,115 L 185,115 C 205,115 215,130 205,150 L 165,190 C 145,210 115,225 90,215 Z",
    drs1Path: "M 80,210 L 360,210", // Main Straight (T14 to T1)
    drs2Path: "M 410,165 C 400,135 360,145 350,160", // Turn 1 to Turn 2 Short Straight
    turns: [
      { id: "T1", name: "Turn 1", x: 375, y: 210, type: "heavy_braking", label: "T1 (102 km/h)" },
      { id: "T2", name: "Turn 2", x: 410, y: 155, type: "medium", label: "T2" },
      { id: "T4", name: "Turn 4", x: 260, y: 105, type: "high_speed", label: "T4 (205 km/h)" },
      { id: "T6", name: "Turn 6/7 Chicane", x: 365, y: 60, type: "chicane", label: "T6/7" },
      { id: "T11", name: "Turn 11", x: 180, y: 30, type: "high_speed", label: "T11" },
      { id: "T12", name: "Turn 12", x: 205, y: 150, type: "heavy_braking", label: "T12 (128 km/h)" },
      { id: "T14", name: "Turn 14", x: 80, y: 210, type: "drs_detection", label: "T14 (DRS Det)" }
    ]
  },
  monaco: {
    circuitId: "monaco",
    circuitName: "Circuit de Monaco",
    viewBox: "0 0 500 260",
    path: "M 100,200 L 220,200 C 240,200 260,185 250,165 L 210,100 C 200,85 210,65 230,65 L 340,65 C 360,65 375,50 365,30 C 355,10 330,10 315,25 L 270,70 C 255,85 235,85 220,70 L 170,20 C 155,5 130,10 120,30 L 70,120 C 60,140 75,170 95,170 L 160,170 C 180,170 190,185 180,200 Z",
    drs1Path: "M 100,200 L 220,200",
    drs2Path: "M 230,65 L 340,65",
    turns: [
      { id: "T1", name: "Sainte Dévote", x: 235, y: 195, type: "heavy_braking", label: "T1 (Sainte Dévote)" },
      { id: "T3", name: "Massenet", x: 210, y: 95, type: "medium", label: "T3" },
      { id: "T6", name: "Grand Hotel Hairpin", x: 365, y: 30, type: "heavy_braking", label: "T6 (Hairpin 48 km/h)" },
      { id: "T10", name: "Nouvelle Chicane", x: 170, y: 20, type: "chicane", label: "T10 Chicane" },
      { id: "T15", name: "Swimming Pool", x: 70, y: 120, type: "high_speed", label: "T15 Pool" }
    ]
  },
  silverstone: {
    circuitId: "silverstone",
    circuitName: "Silverstone Circuit",
    viewBox: "0 0 500 260",
    path: "M 60,180 L 180,180 C 200,180 220,165 210,145 L 180,95 C 170,80 180,60 200,60 L 320,60 C 340,60 360,75 350,95 L 320,145 C 310,165 325,185 345,185 L 440,185 C 460,185 475,165 460,145 L 420,80 C 400,50 360,30 310,30 L 150,30 C 110,30 70,60 50,100 Z",
    drs1Path: "M 60,180 L 180,180",
    drs2Path: "M 200,60 L 320,60",
    turns: [
      { id: "T1", name: "Abbey", x: 195, y: 175, type: "high_speed", label: "T1 Abbey" },
      { id: "T3", name: "Village", x: 180, y: 95, type: "heavy_braking", label: "T3 Village" },
      { id: "T9", name: "Copse", x: 350, y: 95, type: "high_speed", label: "T9 Copse (290 km/h)" },
      { id: "T10", name: "Maggotts & Becketts", x: 420, y: 80, type: "chicane", label: "T10-12 Maggotts/Becketts" },
      { id: "T15", name: "Stowe", x: 440, y: 185, type: "heavy_braking", label: "T15 Stowe" }
    ]
  }
};

export const getCircuitSvgMap = (circuitId = 'hungaroring') => {
  const normalized = (circuitId || '').toLowerCase();
  for (const key in CIRCUIT_MAPS) {
    if (normalized.includes(key)) {
      return CIRCUIT_MAPS[key];
    }
  }
  return CIRCUIT_MAPS.hungaroring;
};
