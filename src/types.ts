import type { LanguageTag } from '../../scannarr/src/utils/language'
import { AUDIO_CODECS, RESOLUTIONS, VIDEO_CODECS, CONTAINERS, NORMALIZED_LANGUAGES } from './common'

// https://en.wikipedia.org/wiki/List_of_hash_functions
// https://cryptography.fandom.com/wiki/List_of_hash_functions
export type CHECKSUM_ALGORITHM =
  (string & {})
  | `CRC-${8 | 16 | 32 | 64}`
  | 'MD5'
  | `SHA-${1 | 3 | 224 | 256 | 384 | 512}`
  | 'Adler-32'
  | `BLAKE${`-${256 | 512}` | `2${'s' | 'b' | 'X'}` | 3}`

export type COMMON_RESOLUTION = typeof RESOLUTIONS[number]
export type RESOLUTION_FORMAT = COMMON_RESOLUTION | `${COMMON_RESOLUTION}p` | `${COMMON_RESOLUTION}px`
export type Resolution = (number & {}) & (RESOLUTION_FORMAT | `${RESOLUTION_FORMAT}x${RESOLUTION_FORMAT}`)

export type COMMON_VIDEO_CODEC = typeof VIDEO_CODECS[number]
export type VIDEO_CODEC = (string & {}) & COMMON_VIDEO_CODEC


export type COMMON_AUDIO_CODEC = typeof AUDIO_CODECS[number]
export type AUDIO_CODEC = (string & {}) & COMMON_AUDIO_CODEC


export type CONTAINER = typeof CONTAINERS[number]

export type LANGUAGE_SHORTHAND = (string & {}) & keyof typeof NORMALIZED_LANGUAGES

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
