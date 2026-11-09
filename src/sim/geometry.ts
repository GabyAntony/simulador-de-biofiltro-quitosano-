/**
 * Escala de escena: 1 unidad = 1 metro.
 * Geometría de un biofiltro de laboratorio (~30 cm de alto).
 */

export const GEO = {
  tableY: 0,
  tableSize: 0.78,
  tableThickness: 0.028,

  column: {
    innerR: 0.027,
    outerR: 0.0305,
    height: 0.26,
    bottomY: 0.152,
    capH: 0.012,
  },

  layers: {
    bottomCottonH: 0.022,
    carbonH: 0.05,
    chitosanH: 0.11,
    topCottonH: 0.022,
  },

  reservoir: {
    innerR: 0.046,
    outerR: 0.0495,
    height: 0.092,
  },

  beaker: {
    innerR: 0.04,
    outerR: 0.043,
    height: 0.115,
    bottomY: 0,
    x: 0.145,
    z: 0.012,
  },

  stand: {
    x: -0.115,
    z: 0,
    baseW: 0.13,
    baseD: 0.13,
    baseH: 0.012,
    rodR: 0.005,
    rodH: 0.42,
    clampYs: [0.25, 0.38] as const,
    armR: 0.0035,
  },

  hoseRadius: 0.0042,
  valveOrificeR: 0.00052,
} as const

export const packingFloorY =
  GEO.column.bottomY + GEO.column.capH

export const layerBounds = {
  bottomCotton: {
    y0: packingFloorY,
    y1: packingFloorY + GEO.layers.bottomCottonH,
  },
  carbon: {
    y0: packingFloorY + GEO.layers.bottomCottonH,
    y1:
      packingFloorY + GEO.layers.bottomCottonH + GEO.layers.carbonH,
  },
  chitosan: {
    y0:
      packingFloorY +
      GEO.layers.bottomCottonH +
      GEO.layers.carbonH,
    y1:
      packingFloorY +
      GEO.layers.bottomCottonH +
      GEO.layers.carbonH +
      GEO.layers.chitosanH,
  },
  topCotton: {
    y0:
      packingFloorY +
      GEO.layers.bottomCottonH +
      GEO.layers.carbonH +
      GEO.layers.chitosanH,
    y1:
      packingFloorY +
      GEO.layers.bottomCottonH +
      GEO.layers.carbonH +
      GEO.layers.chitosanH +
      GEO.layers.topCottonH,
  },
} as const

export const columnTopY = GEO.column.bottomY + GEO.column.height
export const reservoirBottomY = columnTopY
export const reservoirTopY = columnTopY + GEO.reservoir.height

export const bedArea = Math.PI * GEO.column.innerR ** 2
export const reservoirArea = Math.PI * GEO.reservoir.innerR ** 2
export const beakerArea = Math.PI * GEO.beaker.innerR ** 2

/** Longitud de lecho empacado usada en Ergun (quitosano + carbón). */
export const packedBedLength = GEO.layers.chitosanH + GEO.layers.carbonH

export const beakerMaxVolume = beakerArea * (GEO.beaker.height * 0.92)
export const reservoirMaxVolume = reservoirArea * (GEO.reservoir.height * 0.88)

export const valveAreaMax = Math.PI * GEO.valveOrificeR ** 2
