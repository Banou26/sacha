import { LanguageTag } from '../../scannarr/src/utils/language'

// https://en.wikipedia.org/wiki/List_of_hash_functions
// https://cryptography.fandom.com/wiki/List_of_hash_functions
export type CHECKSUM_ALGORITHM =
  (string & {})
  | `CRC-${8 | 16 | 32 | 64}`
  | 'MD5'
  | `SHA-${1 | 3 | 224 | 256 | 384 | 512}`
  | 'Adler-32'
  | `BLAKE${`-${256 | 512}` | `2${'s' | 'b' | 'X'}` | 3}`

export type COMMON_RESOLUTION =
  320 | 480 | 540 | 640 | 720 | 1080
  | 1440 | 2160 | 2880 | 4320 | 5120 | 7680
export type RESOLUTION_FORMAT = COMMON_RESOLUTION | `${COMMON_RESOLUTION}p` | `${COMMON_RESOLUTION}px`
export type Resolution = (number & {}) & (RESOLUTION_FORMAT | `${RESOLUTION_FORMAT}x${RESOLUTION_FORMAT}`)

/** https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Video_codecs */
export type COMMON_VIDEO_CODEC =
  'AV1' | 'AVC' | 'H.263' | 'HEVC' | 'MP4V' |
  'MPEG-1' | 'MPEG-2' | 'Theora' | 'VP8' | 'VP9' |
  /** https://github.com/erengy/anitomy/blob/master/anitomy/keyword.cpp#L105 */
  // '8BIT' | '8-BIT' | '10BIT' | '10BITS' | '10-BIT' | '10-BITS' |
  // 'HI10' | 'HI10P' | 'HI444' | 'HI444P' | 'HI444PP' |
  'H264' | 'H265' | 'H.264' | 'H.265' | 'X264' | 'X265' | 'X.264' |
  'AVC' | 'HEVC' | 'HEVC2' | 'DIVX' | 'DIVX5' | 'DIVX6' | 'XVID'

export type VIDEO_CODEC = (string & {}) & COMMON_VIDEO_CODEC

/** https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Audio_codecs */
export type COMMON_AUDIO_CODEC =
  'AAC' | 'ALAC' | 'AMR' | 'FLAC' | 'G.711' |
  'G.722' | 'MP3' | 'When' | 'Opus' | 'Vorbis' |
  /** https://github.com/erengy/anitomy/blob/master/anitomy/keyword.cpp#L45 */
  'AAC' | 'AACX2' | 'AACX3' | 'AACX4' | 'AC3' | 'EAC3' | 'E-AC-3' |
  'FLAC' | 'FLACX2' | 'FLACX3' | 'FLACX4' | 'LOSSLESS' | 'MP3' | 'OGG' |
  'VORBIS'

export type AUDIO_CODEC = (string & {}) & COMMON_AUDIO_CODEC

/** https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Containers */
export type CONTAINER =
  '3GP' | 'ADTS' | 'FLAC' | 'MPEG' |
  'MPEG-2' | 'MP4' | 'Ogg'| 'MOV'
 // 'MPEG-4' (MP4)
 // 'QuickTime' (MOV)

// https://iso639-3.sil.org/code/${LANG_SHORTHAND}
// https://iso639-3.sil.org/code_tables/639/read
const NORMALIZED_LANGUAGE_MAPPING = {
  'ENG': LanguageTag.EN,
  'POR-BR': LanguageTag.PT,
  'SPA-LA': LanguageTag.ES,
  'SPA': LanguageTag.ES,
  'ARA': LanguageTag.AR,
  'FRE': LanguageTag.FR,
  'GER': LanguageTag.DE,
  'ITA': LanguageTag.IT,
  'JPN': LanguageTag.JA,
  'POR': LanguageTag.PT,
  'POL': LanguageTag.PL,
  'DUT': LanguageTag.NL,
  'NOB': LanguageTag.NB,
  'FIN': LanguageTag.FI,
  'TUR': LanguageTag.TR,
  'SWE': LanguageTag.SV,
  'GRE': LanguageTag.EL,
  'HEB': LanguageTag.HE,
  'RUM': LanguageTag.RM,
  'IND': LanguageTag.ID,
  'THA': LanguageTag.TH,
  'KOR': LanguageTag.KO,
  'DAN': LanguageTag.DA,
  'CHI': LanguageTag.ZH,
  'VIE': LanguageTag.VI,
  'UKR': LanguageTag.UK,
  'HUN': LanguageTag.HU,
  'CES': LanguageTag.CS,
  'HRV': LanguageTag.HR,
  'MAY': LanguageTag.MS,
  'FIL': LanguageTag.FIL,
  'RUS': LanguageTag.RU
} as const

export type LANGUAGE_SHORTHAND = (string & {}) & keyof typeof NORMALIZED_LANGUAGE_MAPPING

export type MediaBase = {
  group?: string
  filename: string
  title: string
  year?: number
  checksum_algorithm?: CHECKSUM_ALGORITHM
  checksum?: string
  resolution?: Resolution
  videoCodec?: VIDEO_CODEC
  audioCodec?: AUDIO_CODEC
  containerFormat?: CONTAINER
} & (
  {
    language: LanguageTag
  }
  | {
    languages: LanguageTag[]
  }
)

export type EpisodeMedia =
  MediaBase
  & {
    episodeTitle?: string
  }
  & (
    {
      /** singular episode */
      episode: number
    } | {
      /** Range of episodes 1-11 52-69 -> [[1, 11], [52,69]] */
      episodes: [number, number][]
      /** Bundle of multiple episodes */
      batch: boolean
    }
  )

export type MovieMedia = MediaBase & {
  /** singular episode */
  episode: number
} | {
  /** Range of episodes 1-11 52-69 -> [[1, 11], [52,69]] */
  episodes: [number, number][]
  /** Bundle of multiple episodes */
  batch: boolean
}

export type Media = MovieMedia | EpisodeMedia