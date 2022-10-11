import {
  str, sequenceOf, choice, char, many, many1,
  everyCharUntil, endOfInput, anyCharExcept,
  whitespace, digit, Ok, Parser, 
} from 'arcsecond'
import { AUDIO_CODECS, AUDIO_TERMS, RESOLUTIONS, VIDEO_CODECS, NORMALIZED_LANGUAGES, VIDEO_TERMS, TYPE_TERMS, normalizeVideoCodec, SUBTITLE_TERMS, NORMALIZED_SUBTITLE_LANGUAGES, SOURCE_TERMS, SEASON_TERMS, BATCH_TERMS } from './common'
import { istr, ichar } from './utils'

import { groupBy } from 'fp-ts/lib/NonEmptyArray'
import { flatten, map } from 'fp-ts/lib/Array'
import { fromEntries, toEntries } from 'fp-ts/lib/Record'
import { filter } from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/function'
import { Resolution } from './types'
import { extractArray } from './utils/array'

type RegroupStringPrimitive = string | number | { [key: string]: any }
type RegroupStringPart<S extends RegroupStringPrimitive> = S | S[]
export type RegroupString = RegroupStringPart<RegroupStringPart<RegroupStringPrimitive>>

const regroupStrings = <T extends RegroupString>(tokens: T[]): T[] =>
  tokens
    .reduce<T[]>((acc, token) => {
      if (!acc.length) return [...acc, token]
      const rest = acc.slice(0, -1)
      const previousToken: any = acc.at(-1)
      return [
        ...rest,
        ...(
          Array.isArray(token)
            ? [previousToken, regroupStrings(token)]
            : (
              typeof previousToken === 'object' || typeof token === 'object'
                ? [previousToken, token]
                : [`${previousToken ?? ''}${token}`]
            )
        )
      ] as T[]
    }, [])

/** https://github.com/erengy/anitomy/blob/master/anitomy/tokenizer.cpp#L46 */
const metadataDelimiters = {
  '(': ')',  // U+0028-U+0029 Parenthesis
  '[': ']',  // U+005B-U+005D Square bracket
  '{': '}',  // U+007B-U+007D Curly bracket
  '「': '」',  // Corner bracket ['\u300C', '\u300D']
  '『': '』',  // White corner bracket ['\u300E', '\u300F']
  '【': '】',  // Black lenticular bracket ['\u3010', '\u3011']
  '（': '）'  // Fullwidth parenthesis ['\uFF08', '\uFF09']
 } as const

type Delimiter = keyof typeof metadataDelimiters
type CorrespondDelimiter<T extends Delimiter> = typeof metadataDelimiters[T]

const delimitersArray = Object.keys(metadataDelimiters) as Delimiter[]

const getCorrespondingDelimiter = <T extends Delimiter>(delimiter: T) => metadataDelimiters[delimiter]

const subtitleTermToken = choice (
  SUBTITLE_TERMS
    .map(istr)
) as Parser<typeof SUBTITLE_TERMS[number]>

const batchTermToken = choice (
  BATCH_TERMS
    .map(istr)
) as Parser<typeof BATCH_TERMS[number]>

const resolutionNumberToken = choice (
  RESOLUTIONS.map(res => str(res.toString()))
) as Parser<`${typeof RESOLUTIONS[number]}`>

const resolutionTokenPrimitive =
  choice ([
    sequenceOf ([
      resolutionNumberToken,
      istr ('px') as Parser<'px'>
    ]),
    sequenceOf ([
      resolutionNumberToken,
      ichar ('p') as Parser<'p'>
    ]),
    resolutionNumberToken
  ])

const resolutionToken =
  choice ([
    resolutionTokenPrimitive,
    sequenceOf ([
      resolutionTokenPrimitive,
      ichar ('x') as Parser<'p'>,
      resolutionTokenPrimitive
    ])
  ])

const videoCodecToken =
  choice (
    VIDEO_CODECS
      .map(str)
  ) as Parser<typeof VIDEO_CODECS[number]>

const videoTermToken =
  choice (
    VIDEO_TERMS
      .map(str)
  ) as Parser<typeof VIDEO_TERMS[number]>

const typeTermToken =
  choice (
    TYPE_TERMS
      .map(str)
  ) as Parser<typeof TYPE_TERMS[number]>

const audioCodecToken =
  choice (
    AUDIO_CODECS
      .map(str)
  ) as Parser<typeof AUDIO_CODECS[number]>

const audioTermToken =
  choice (
    AUDIO_TERMS
      .map(str)
  ) as Parser<typeof AUDIO_TERMS[number]>

const audioLanguageTermsToken =
  choice (
    Object
      .keys(NORMALIZED_LANGUAGES)
      .map(str)
  ) as Parser<keyof typeof NORMALIZED_LANGUAGES>

const subtitleLanguageTermsToken =
  choice (
    Object
      .keys(NORMALIZED_SUBTITLE_LANGUAGES)
      .map(str)
  ) as Parser<keyof typeof NORMALIZED_SUBTITLE_LANGUAGES>

const sourceTermsToken =
  choice (
    Object
      .keys(SOURCE_TERMS)
      .map(str)
  ) as Parser<keyof typeof SOURCE_TERMS>

const seasonTermsToken =
  choice (
    Object
      .keys(SEASON_TERMS)
      .map(str)
  ) as Parser<keyof typeof SEASON_TERMS>

const yearToken = sequenceOf([
  digit,
  digit,
  digit,
  digit
])

const datePartToken = sequenceOf([
  digit,
  digit
])

type ExtractParserResult<T extends Parser<any>> = Extract<ReturnType<T['run']>, Ok<any, any>>['result']

const dateToken = choice([
  sequenceOf([
    yearToken,
    char('.'),
    datePartToken,
    char('.'),
    datePartToken
  ]),
  sequenceOf([
    datePartToken,
    char('.'),
    datePartToken,
    char('.'),
    yearToken
  ]),
  yearToken
])

const versionToken = sequenceOf([
  ichar('v'),
  digit
])

const nonDelimitedGroupToken = sequenceOf([
  char('-'),
  many (
    anyCharExcept (
      choice([
        char ('.'),
        whitespace
      ])
    )
  )
]).map(result => ({ type: 'groups' as const, value: regroupStrings(result).flat() }))

const metadataTokenValue = [
  versionToken.map(res => ({ type: 'versionTerms' as const, value: res })),
  typeTermToken.map(res => ({ type: 'typeTerms' as const, value: res })),
  audioCodecToken.map(res => ({ type: 'audioCodecTerms' as const, value: res })),
  audioTermToken.map(res => ({ type: 'audioTerms' as const, value: res })),
  videoCodecToken.map(res => ({ type: 'videoCodecTerms' as const, value: res })),
  videoTermToken.map(res => ({ type: 'videoTerms' as const, value: res })),
  resolutionToken.map(res => ({ type: 'resolutionTerms' as const, value: res })),
  // batchTermToken.map(res => ({ type: 'batchTerms' as const, value: res })),
  subtitleTermToken.map(res => ({ type: 'subtitleTerms' as const, value: res })),
  // todo: make a system that takes all terms, sort them by length, apply them, and re-categorize them back to prevent issues with small terms overriding longer ones
  // Subtitle language token needs to be higher than language tokens as it generally has longer matching tokens than language
  subtitleLanguageTermsToken.map(res => ({ type: 'subtitleLanguageTerms' as const, value: res })),
  audioLanguageTermsToken.map(res => ({ type: 'audioLanguageTerms' as const, value: res })),
  seasonTermsToken.map(res => ({ type: 'seasonTerms' as const, value: res })),
  sourceTermsToken.map(res => ({ type: 'sourceTerms' as const, value: res })),
  // Date token needs to be furthest down as it can override other tokens like resolutions
  dateToken.map(res => ({ type: 'dates' as const, value: res }))
] as const

const delimitedMetadataTokenValue = (delimiter: Delimiter) =>
  choice ([
    ...metadataTokenValue,
    whitespace,
    anyCharExcept (char (getCorrespondingDelimiter(delimiter)))
  ])

const makeDelimitedMetadataToken = <T extends Delimiter>(delimiter: T) =>
  sequenceOf ([
    char (delimiter) as Parser<Delimiter>,
    many (delimitedMetadataTokenValue (delimiter)),
    char (getCorrespondingDelimiter(delimiter)) as Parser<CorrespondDelimiter<Delimiter>>
  ]).map((result) => ({
    type: 'METADATA' as const,
    delimiter,
    value: regroupStrings(result).slice(1, -1).flat()
  }))

const nonDelimitedMetadataToken =
  choice ([
    ...metadataTokenValue,
    nonDelimitedGroupToken
  ])
    .map((result) => ({
      type: 'METADATA' as const,
      value: result
    }))

const metadataToken =
  choice (
    [
      ...delimitersArray.map(makeDelimitedMetadataToken),
      nonDelimitedMetadataToken
    ]
  )  as Parser<
    ExtractParserResult<ReturnType<typeof makeDelimitedMetadataToken>>
    | ExtractParserResult<typeof nonDelimitedMetadataToken>
  >

const nonMetadataToken =
  everyCharUntil ( choice ([metadataToken, endOfInput]))
    .map(result => ({
      type: 'DATA' as const,
      value: result as string
    }))

const token = choice ([
  metadataToken,
  nonMetadataToken
])

export type RootToken = ExtractParserResult<typeof token>
export type MetadataToken = Exclude<Extract<RootToken, { type: 'METADATA' }>['value'][number], string | number>
export type Token = RootToken | MetadataToken

type TokenResult = {
  type: string
  value: any
}

type GroupBy<T extends TokenResult[]> = {
  [K in T[number]['type']]:
    Extract<T[number], { type: K }>['value'][]
}

const parser =
  many1 (token)
    .map((_tokens) => {
      const [_firstToken, ...restTokens] = _tokens

      type foo = Extract<typeof _tokens[number], { type: 'METADATA' }>['value']
      type bar = Extract<foo, { type: 'groups' }>

      const firstToken =
        (_firstToken.type === 'METADATA'
        && _firstToken.value.length === 1
        && typeof _firstToken.value[0] === 'string')
          ? { ..._firstToken, value: [{ type: 'group' as const, value: _firstToken.value[0] }] }
          : _firstToken

      const tokens = [firstToken, ...restTokens]

      const dataTokens =
        pipe(
          tokens,
          filter((token): token is typeof token & { type: 'DATA' } => token.type === 'DATA'),
          filter(token =>
            typeof token.value === 'string'
              ? !!token.value.trim().length
              : true
          ),
          map(token => ({
            type: 'titles',
            value: token.value.trim()
          }) as const)
        )

      console.log('dataTokens', dataTokens)

      const metadataTokens =
        pipe(
          tokens,
          filter(token => token.type === 'METADATA')
        )

      const parsedMetadata = pipe(
        metadataTokens,
        map((token) => token?.value),
        filter((token): token is typeof token & { value: any } => token),
        flatten,
        filter(value =>
          value
          && typeof value === 'object'
          && !Array.isArray(value),
        ),
        filter((token): token is Extract<typeof token, { type: string }> => typeof token === 'object')
      )

      // todo: could try to remove that as unknown by making a properly typed groupBy or smth: https://github.com/gcanti/fp-ts/issues/797#issuecomment-477969998 ?
      const groupedResults = pipe(
        // parsedMetadata,
        [...parsedMetadata, ...dataTokens],
        groupBy((token) => token.type),
        toEntries,
        map(([key, val]) => [key, val.map(token => token.value)]),
        // @ts-ignore
        fromEntries
      ) as unknown as GroupBy<typeof parsedMetadata | typeof dataTokens>

      return groupedResults
    })

const flatMergeStringGroups = <T extends (string | number) | (string | number)[]>(stringGroup: T) =>
  Array.isArray(stringGroup)
    ? stringGroup.join('')
    : stringGroup

export const parse = (str: string) => {
  const parserResult = parser.run(str)
  if (parserResult.isError) throw new Error('Parser errored')
  const { result } = parserResult
  console.log('parser result', result)

  return {
    titles: result.titles?.map(flatMergeStringGroups),
    videoCodecTerms: result.videoCodecTerms?.map(flatMergeStringGroups),
    audioCodecTerms: result.audioCodecTerms?.map(flatMergeStringGroups),
    audioLanguageTerms: result.audioLanguageTerms?.map(flatMergeStringGroups),
    groups: result.groups?.map(flatMergeStringGroups),
    versionTerms: result.versionTerms?.map(flatMergeStringGroups),
    batchTerms: result.batchTerms?.map(flatMergeStringGroups),
    subtitleTerms: result.subtitleTerms?.map(flatMergeStringGroups),
    typeTerms: result.typeTerms?.map(flatMergeStringGroups),
    subtitleLanguageTerms: result.subtitleLanguageTerms?.map(flatMergeStringGroups),
    audioTerms: result.audioTerms?.map(flatMergeStringGroups),
    videoTerms: result.videoTerms?.map(flatMergeStringGroups),
    seasonTerms: result.seasonTerms?.map(flatMergeStringGroups),
    sourceTerms: result.sourceTerms?.map(flatMergeStringGroups),
    dates: result.dates?.map(dateGroup =>
      Array.isArray(dateGroup)
        ? dateGroup.join('')
        : dateGroup
    ),
    resolutionTerms:
      result.resolutionTerms?.map(resolutionTermGroup =>
        Array.isArray(resolutionTermGroup)
          ? resolutionTermGroup.join('')
          : resolutionTermGroup
      )
  }
}

export const format = <T extends ReturnType<typeof parse>>(result: T) => {
  const group = result.group
  const resolution =
    Array.isArray(result.resolution)
      ? result.resolution.map(Number) as Resolution[]
      : Number(result.resolution) as Resolution

  const languages = result.language?.map(lang => NORMALIZED_LANGUAGES[lang])
  const videoCodecs = result.videoCodec?.map(normalizeVideoCodec)
  const audioCodecs = result.audioCodec?.map(codec => AUDIO_CODECS[codec])

  return {
    ...result,
    group,
    resolution,
    languages
  }
}

export default parse

// const res = parse('[silly] Cyberpunk Edgerunners (WEB-DL 1080p HEVC E-AC-3) [Dual-Audio]')
// console.log(res)

// const res2 = parse('[Erai-raws] Mushoku Tensei - Isekai Ittara Honki Dasu Part 2 - Eris the Goblin Slayer [1080p][HEVC][Multiple Subtitle] [ENG][POR-BR][SPA][FRE][GER]')
// console.log(res2)

const res3 = parse('[EMBER] Cyberpunk: Edgerunners (2022) (Season 1) [WEBRip] [1080p Dual Audio HEVC 10 bits] (Cyberpunk Edgerunners) (Batch)')
console.log(res3)


// console.log(format(res))
// console.log(format(res2))
