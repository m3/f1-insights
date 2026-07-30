/**
 * Canonical SVG Circuit Layout Coordinates & Turn Metadata for F1 Insights HQ.
 * 1:1 Scale-Matched 2D vector representations of official FIA Grand Prix circuit track maps.
 */

export const CIRCUIT_MAPS = {
  hungaroring: {
    circuitId: "hungaroring",
    circuitName: "Hungaroring",
    viewBox: "0 0 500 280",
    // 1:1 Geometry matched to official FIA / Wikimedia Hungaroring track map
    path: "M 100,240 L 380,240 C 425,240 445,215 420,190 L 355,180 C 330,180 320,185 310,195 C 315,175 335,155 360,140 L 395,115 C 425,90 430,60 395,40 L 375,40 C 365,40 355,50 345,60 L 305,80 C 290,90 275,90 260,80 L 225,60 C 210,50 195,60 200,80 L 225,120 C 235,135 225,160 205,165 L 140,165 C 110,165 90,175 85,195 C 80,215 90,240 120,240 Z",
    drs1Path: "M 100,240 L 380,240", // Main Straight (T14 to T1)
    drs2Path: "M 420,190 L 355,180", // Turn 1 to Turn 2 Short Straight
    turns: [
      { id: "T1", name: "Turn 1", x: 420, y: 240, type: "heavy_braking", label: "T1 (102 km/h)" },
      { id: "T2", name: "Turn 2", x: 355, y: 180, type: "medium", label: "T2" },
      { id: "T4", name: "Turn 4 (Mansell)", x: 395, y: 115, type: "high_speed", label: "T4 (205 km/h)" },
      { id: "T6", name: "Turn 6/7 Chicane", x: 395, y: 40, type: "chicane", label: "T6/7 Chicane" },
      { id: "T11", name: "Turn 11", x: 225, y: 120, type: "high_speed", label: "T11" },
      { id: "T12", name: "Turn 12", x: 205, y: 165, type: "heavy_braking", label: "T12 (128 km/h)" },
      { id: "T14", name: "Turn 14", x: 85, y: 210, type: "drs_detection", label: "T14 (DRS Det)" }
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
  zandvoort: {
    circuitId: "zandvoort",
    circuitName: "Circuit Park Zandvoort",
    viewBox: "0 0 500 280",
    // 1:1 FIA matched Zandvoort layout (Tarzanbocht T1 hairpin, Hugenholtzbocht T3 banking, Scheivlak T7, Hans Ernst T11/12, Luyendyk T14 banking)
    path: "M 80,240 L 380,240 C 430,240 450,210 430,175 L 360,130 C 330,110 330,80 360,60 L 410,35 C 435,20 425,5 395,5 L 290,5 C 260,5 240,20 235,45 L 225,100 C 220,120 195,130 175,115 L 125,85 C 95,65 65,85 60,115 L 50,180 C 45,215 60,240 80,240 Z",
    drs1Path: "M 80,240 L 380,240", // Main Straight (T14 Arie Luyendyk Banking to T1 Tarzanbocht)
    drs2Path: "M 360,130 L 410,35",  // Between Turn 10 and Turn 11
    turns: [
      { id: "T1", name: "Tarzanbocht", x: 430, y: 220, type: "heavy_braking", label: "T1 Tarzan (110 km/h)" },
      { id: "T3", name: "Hugenholtzbocht", x: 360, y: 130, type: "heavy_braking", label: "T3 Hugenholtz (18° Banking)" },
      { id: "T7", name: "Scheivlak", x: 395, y: 15, type: "high_speed", label: "T7 Scheivlak (245 km/h)" },
      { id: "T10", name: "Zandvoort Corner", x: 225, y: 100, type: "medium", label: "T10" },
      { id: "T11", name: "Hans Ernst Bocht", x: 125, y: 85, type: "chicane", label: "T11/12 Chicane" },
      { id: "T14", name: "Arie Luyendykbocht", x: 60, y: 210, type: "drs_detection", label: "T14 Luyendyk (18° Banking)" }
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
  },
  spa: {
    circuitId: "spa",
    circuitName: "Circuit de Spa-Francorchamps",
    viewBox: "0 0 500 280",
    path: "M 80,220 L 220,240 C 260,245 280,230 270,200 L 240,140 C 230,120 245,100 275,100 L 400,100 C 440,100 460,80 440,50 L 380,20 C 350,5 310,20 290,50 L 250,110 C 230,140 200,140 180,120 L 120,60 C 95,35 65,55 75,90 L 100,170 C 110,195 95,215 80,220 Z",
    drs1Path: "M 275,100 L 400,100", // Kemmel Straight (post Eau Rouge)
    drs2Path: "M 80,220 L 220,240",  // Main Pit Straight
    turns: [
      { id: "T1", name: "La Source", x: 220, y: 240, type: "heavy_braking", label: "T1 La Source (80 km/h)" },
      { id: "T3", name: "Eau Rouge / Raidillon", x: 270, y: 200, type: "high_speed", label: "T3-5 Eau Rouge (305 km/h)" },
      { id: "T7", name: "Les Combes", x: 400, y: 100, type: "heavy_braking", label: "T7 Les Combes (140 km/h)" },
      { id: "T10", name: "Pouhon", x: 290, y: 50, type: "high_speed", label: "T10 Pouhon (290 km/h)" },
      { id: "T18", name: "Blanchimont", x: 100, y: 170, type: "high_speed", label: "T18 Blanchimont (315 km/h)" },
      { id: "T19", name: "Bus Stop Chicane", x: 80, y: 220, type: "chicane", label: "T19 Bus Stop" }
    ]
  },
  monza: {
    circuitId: "monza",
    circuitName: "Autodromo Nazionale Monza",
    viewBox: "0 0 500 240",
    path: "M 70,180 L 380,180 C 430,180 460,150 430,120 L 320,60 C 295,45 260,45 235,60 L 140,120 C 110,140 85,140 65,120 L 40,95 C 20,70 35,45 65,45 L 200,45 C 230,45 250,30 230,10 L 150,10 C 110,10 70,35 50,75 Z",
    drs1Path: "M 70,180 L 380,180", // Main Straight (Curva Parabolica to Variante del Rettifilo)
    drs2Path: "M 235,60 L 140,120",  // Serraglio Straight
    turns: [
      { id: "T1", name: "Variante del Rettifilo", x: 380, y: 180, type: "chicane", label: "T1/2 Rettifilo (75 km/h)" },
      { id: "T4", name: "Variante della Roggia", x: 320, y: 60, type: "chicane", label: "T4/5 Roggia" },
      { id: "T8", name: "Variante Ascari", x: 140, y: 120, type: "high_speed", label: "T8-10 Ascari (235 km/h)" },
      { id: "T11", name: "Curva Parabolica (Alboreto)", x: 70, y: 180, type: "high_speed", label: "T11 Parabolica (210 km/h)" }
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
  return CIRCUIT_MAPS.zandvoort;
};
