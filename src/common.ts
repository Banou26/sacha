import { pipe } from 'fp-ts/lib/function'
import { toUndefined } from 'fp-ts/lib/Option'
import * as A from 'fp-ts/lib/ReadonlyArray'
import * as REA from 'fp-ts/lib/ReadonlyNonEmptyArray'
import * as RR from 'fp-ts/lib/ReadonlyRecord'
import * as O from 'fp-ts/lib/Option'
import { LanguageTag } from './utils/language'

// needed as small tokens might override more specific tokens
const sortTermLength = <T extends readonly string[]>(terms: T) =>
  [...terms].sort((str, str2) => str2.length - str.length)

export const RESOLUTIONS = [320, 480, 540, 640, 720, 1080, 1440, 2160, 2880, 4320, 5120, 7680] as const

const makeColorDepth = <T extends number>(num: T) => [
  `${num}BIT`,
  `${num} BIT`,
  `${num}BITS`,
  `${num} BITS`,
  `${num}-BIT`,
  `${num} BIT`,
  `${num}-BITS`,
  `${num} BITS`
] as const

/** https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Video_codecs */
export const VIDEO_CODECS = sortTermLength([
  'AV1', 'AVC', 'H.263', 'HEVC', 'MP4V',
  'MPEG-1', 'MPEG-2', 'Theora', 'VP8', 'VP9',
  /** https://github.com/erengy/anitomy/blob/master/anitomy/keyword.cpp#L105 */
  // '8BIT', '8-BIT', '10BIT', '10BITS', '10-BIT', '10-BITS' |
  // 'HI10', 'HI10P', 'HI444', 'HI444P', 'HI444PP' |
  'H264', 'H265', 'H.264', 'H.265', 'X264', 'X265', 'X.264',
  /* 'AVC', 'HEVC', */ 'HEVC2', 'DIVX', 'DIVX5', 'DIVX6', 'XVID',
  ...makeColorDepth(8), ...makeColorDepth(10), ...makeColorDepth(12)
] as const)

const makeH2XX = <T extends number>(num: T) => [
  `H26${num}`,
  `H.26${num}`,
  `X26${num}`,
  `X.26${num}`
] as const

export const NORMALIZED_VIDEO_CODECS = {
  'AV1': ['AV1'],
  'H261': makeH2XX(1),
  'H262': makeH2XX(2),
  'H263': makeH2XX(3),
  'H264': ['AVC', ...makeH2XX(4)],
  'H265': ['HEVC', ...makeH2XX(5)],
  'VP8': ['VP8'],
  'VP9': ['VP9'],
  '8BIT': makeColorDepth(8),
  '10BIT': makeColorDepth(10),
  '12BIT': makeColorDepth(12)
} as const

type VideoCodec = typeof NORMALIZED_VIDEO_CODECS[keyof typeof NORMALIZED_VIDEO_CODECS][number]

// const mappedVideoCodecs = pipe(
//   NORMALIZED_VIDEO_CODECS,
//   RR.toEntries,
//   A.map(([key, val]) => pipe(
//     val,
//     REA.map<typeof val[number], [typeof val[number], typeof key]>((codec) => [codec, key])
//   )),
//   A.flatten,
//   RR.fromEntries
// )

// const res = mappedVideoCodecs['AV1']

// const mappedVideoCodecs =
//   Object.fromEntries(
//     Object
//       .entries(NORMALIZED_VIDEO_CODECS)
//       .flatMap(([normalized, variant]) => variant.map((codec => [codec, normalized])))
//   ) as { [Key in VideoCodec]: keyof typeof NORMALIZED_VIDEO_CODECS }

export const normalizeVideoCodec = <T extends VideoCodec>(videoCodec: T) =>
    pipe(
      NORMALIZED_VIDEO_CODECS,
      RR.toEntries,
      A.findFirst(([normalizedName, variants]) => variants.some(variant => variant === videoCodec)),
      O.map(([normalizedName]) => normalizedName),
      toUndefined
    )

const NORMALIZED_COLOR_DEPTH = {
  '8BIT': makeColorDepth(8),
  '10BIT': makeColorDepth(10),
  '12BIT': makeColorDepth(12)
} as const

export const VIDEO_TERMS = sortTermLength([
  'HDR',
  /** Dolby Vision (HDR) */
  'DV'
] as const)

export const TYPE_TERMS = sortTermLength([
  'WEB', 'WEB-DL', 'WEBRip'
] as const)

/** https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Audio_codecs */
export const AUDIO_CODECS = sortTermLength([
  'AAC', 'ALAC', 'AMR', 'FLAC', 'G.711',
  'G.722', 'MP3', 'When', 'Opus', 'Vorbis',
  /** https://github.com/erengy/anitomy/blob/master/anitomy/keyword.cpp#L45 */
  'AAC', 'AACX2', 'AACX3', 'AACX4', 'AC3', 'EAC3', 'E-AC-3',
  /** Dolby Digital Plus, also known as Enhanced AC-3 */
  'DDP5', 'DDP5.1',
  'FLAC', 'FLACX2', 'FLACX3', 'FLACX4', 'LOSSLESS', 'MP3', 'OGG',
  'VORBIS', 
] as const)

export const AUDIO_TERMS = sortTermLength([
  'Dual-Audio', 'Dual Audio'
] as const)

/** https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Containers */
export const CONTAINER_TERMS = sortTermLength([
  '3GP', 'ADTS', 'FLAC', 'MPEG',
  'MPEG-2', 'MP4', 'Ogg', 'MOV',
  'MKV'
   // 'MPEG-4' (MP4)
  // 'QuickTime' (MOV)
] as const)

// https://iso639-3.sil.org/code/${LANG_SHORTHAND}
// https://iso639-3.sil.org/code_tables/639/read
export const NORMALIZED_LANGUAGES = {
  ENG: LanguageTag.EN,
  'POR-BR': LanguageTag.PT,

  'SPA-LA': LanguageTag.ES,
  SPA: LanguageTag.ES,

  ARA: LanguageTag.AR,

  FRE: LanguageTag.FR,
  FR: LanguageTag.FR,
  VF: LanguageTag.FR,

  GER: LanguageTag.DE,
  ITA: LanguageTag.IT,
  JPN: LanguageTag.JA,
  POR: LanguageTag.PT,
  POL: LanguageTag.PL,
  DUT: LanguageTag.NL,
  NOB: LanguageTag.NB,
  FIN: LanguageTag.FI,
  TUR: LanguageTag.TR,
  SWE: LanguageTag.SV,
  GRE: LanguageTag.EL,
  HEB: LanguageTag.HE,
  RUM: LanguageTag.RM,
  IND: LanguageTag.ID,
  THA: LanguageTag.TH,
  KOR: LanguageTag.KO,
  DAN: LanguageTag.DA,
  CHI: LanguageTag.ZH,
  VIE: LanguageTag.VI,
  UKR: LanguageTag.UK,
  HUN: LanguageTag.HU,
  CES: LanguageTag.CS,
  HRV: LanguageTag.HR,
  MAY: LanguageTag.MS,
  FIL: LanguageTag.FIL,
  RUS: LanguageTag.RU
} as const

export const AUDIO_LANGUAGE_TERMS_CASE_SENSITIVE = sortTermLength(['MULTi'] as const)
export const AUDIO_LANGUAGE_TERMS = sortTermLength(['Optional Dual Audio', 'Dual Audio'] as const)

export const NORMALIZED_SUBTITLE_LANGUAGES = {
  'VOSTFR': LanguageTag.FR,
} as const

export const SUBTITLE_TERMS = sortTermLength(['multi-sub', 'multi-subs', 'multi subs', 'multiple subtitle', 'subtitle'] as const)

export const BATCH_TERMS = sortTermLength(['batch', 'batched'] as const)

export const SOURCE_TERMS = {
  'NF': 'Netflix',
  'AMZ': 'Amazon'
} as const

export const SEASON_PART_TERMS = sortTermLength(['Season', 'S'] as const)

// export const SEASON_TERMS = {
//   'S01': 1,
// } as const
