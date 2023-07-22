import {
  str, sequenceOf, choice, char, many, many1,
  everyCharUntil, endOfInput, anyCharExcept,
  whitespace, digit, Ok, Parser, everythingUntil, between, lookAhead, 
} from 'arcsecond'
import {
  AUDIO_CODECS, AUDIO_TERMS, RESOLUTIONS, VIDEO_CODECS,
  NORMALIZED_LANGUAGES, VIDEO_TERMS, TYPE_TERMS,
  SUBTITLE_TERMS, NORMALIZED_SUBTITLE_LANGUAGES,
  SOURCE_TERMS, SEASON_TERMS, BATCH_TERMS,
  normalizeVideoCodec,
  SEASON_PART_TERMS,
  AUDIO_LANGUAGE_TERMS,
  AUDIO_LANGUAGE_TERMS_CASE_SENSITIVE,
  VIDEO_FORMAT_TERMS,
  CONTAINER_TERMS
} from './common'
import { istr, ichar } from './utils'

import { groupBy } from 'fp-ts/lib/NonEmptyArray'
import { flatten, map } from 'fp-ts/lib/Array'
import { fromEntries, toEntries } from 'fp-ts/lib/Record'
import { filter } from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/function'
import { Resolution } from './types'

declare function _choice<A>([p1]: [Parser<A>]): Parser<A>;
declare function _choice<A, B>([p1, p2]: [Parser<A>, Parser<B>]): Parser<A | B>;
declare function _choice<A, B, C>([p1, p2, p3]: [Parser<A>, Parser<B>, Parser<C>]): Parser<A | B | C>;
declare function _choice<A, B, C, D>([p1, p2, p3, p4]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>]): Parser<A | B | C | D>;
declare function _choice<A, B, C, D, E>([p1, p2, p3, p4, p5]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>]): Parser<A | B | C | D | E>;
declare function _choice<A, B, C, D, E, F>([p1, p2, p3, p4, p5, p6]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>]): Parser<A | B | C | D | E | F>;
declare function _choice<A, B, C, D, E, F, G>([p1, p2, p3, p4, p5, p6, p7]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>]): Parser<A | B | C | D | E | F | G>;
declare function _choice<A, B, C, D, E, F, G, H>([p1, p2, p3, p4, p5, p6, p7, p8]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>]): Parser<A | B | C | D | E | F | G | H>;
declare function _choice<A, B, C, D, E, F, G, H, I>([p1, p2, p3, p4, p5, p6, p7, p8, p9]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>]): Parser<A | B | C | D | E | F | G | H | I>;
declare function _choice<A, B, C, D, E, F, G, H, I, J>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>]): Parser<A | B | C | D | E | F | G | H | I | J>;
declare function _choice<A, B, C, D, E, F, G, H, I, J, K>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>]): Parser<A | B | C | D | E | F | G | H | I | J | K>;
declare function _choice<A, B, C, D, E, F, G, H, I, J, K, L>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>]): Parser<A | B | C | D | E | F | G | H | I | J | K | L>;
declare function _choice<A, B, C, D, E, F, G, H, I, J, K, L, M>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>, Parser<M>]): Parser<A | B | C | D | E | F | G | H | I | J | K | L | M>;
declare function _choice<A, B, C, D, E, F, G, H, I, J, K, L, M, N>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>, Parser<M>, Parser<N>]): Parser<A | B | C | D | E | F | G | H | I | J | K | L | M | N>;
declare function _choice<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>, Parser<M>, Parser<N>, Parser<O>]): Parser<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O>;
declare function _choice<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>, Parser<M>, Parser<N>, Parser<O>, Parser<P>]): Parser<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P>;
declare function _choice<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>, Parser<M>, Parser<N>, Parser<O>, Parser<P>, Parser<Q>]): Parser<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q>;
declare function _choice<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>, Parser<M>, Parser<N>, Parser<O>, Parser<P>, Parser<Q>, Parser<R>]): Parser<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R>;
declare function _choice<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>, Parser<M>, Parser<N>, Parser<O>, Parser<P>, Parser<Q>, Parser<R>, Parser<S>]): Parser<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R| S>;
declare function _choice<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T>([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20]: [Parser<A>, Parser<B>, Parser<C>, Parser<D>, Parser<E>, Parser<F>, Parser<G>, Parser<H>, Parser<I>, Parser<J>, Parser<K>, Parser<L>, Parser<M>, Parser<N>, Parser<O>, Parser<P>, Parser<Q>, Parser<R>, Parser<S>, Parser<T>]): Parser<A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R| S | T>;
declare function _choice(parsers: Parser<any>[]): Parser<any>;

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
      .map(istr)
  ) as Parser<typeof VIDEO_CODECS[number]>

const containerTermToken =
  choice (
    CONTAINER_TERMS
      .map(istr)
  ) as Parser<typeof CONTAINER_TERMS[number]>

const videoTermToken =
  choice (
    VIDEO_TERMS
      .map(istr)
  ) as Parser<typeof VIDEO_TERMS[number]>

const typeTermToken =
  choice (
    TYPE_TERMS
      .map(istr)
  ) as Parser<typeof TYPE_TERMS[number]>

const audioCodecToken =
  choice (
    AUDIO_CODECS
      .map(istr)
  ) as Parser<typeof AUDIO_CODECS[number]>

const audioTermToken =
  choice (
    AUDIO_TERMS
      .map(istr)
  ) as Parser<typeof AUDIO_TERMS[number]>

const audioLanguageTermsToken =
  choice (
    [
      ...Object
        .keys(NORMALIZED_LANGUAGES)
        .map(istr)
      ,
      ...AUDIO_LANGUAGE_TERMS.map(istr),
      ...AUDIO_LANGUAGE_TERMS_CASE_SENSITIVE.map(str)
    ]
  ) as Parser<
    keyof typeof NORMALIZED_LANGUAGES
    | typeof AUDIO_LANGUAGE_TERMS[number]
    | typeof AUDIO_LANGUAGE_TERMS_CASE_SENSITIVE[number]
  >

const subtitleLanguageTermsToken =
  choice (
    Object
      .keys(NORMALIZED_SUBTITLE_LANGUAGES)
      .map(istr)
  ) as Parser<keyof typeof NORMALIZED_SUBTITLE_LANGUAGES>

const sourceTermsToken =
  choice (
    Object
      .keys(SOURCE_TERMS)
      .map(istr)
  ) as Parser<keyof typeof SOURCE_TERMS>

// const seasonTermsToken =
//   choice (
//     Object
//       .keys(SEASON_TERMS)
//       .map(istr)
//   ) as Parser<keyof typeof SEASON_TERMS>

const yearToken = sequenceOf ([
  digit,
  digit,
  digit,
  digit
])

const datePartToken = sequenceOf ([
  digit,
  digit
])

type ExtractParserResult<T extends Parser<any>> = Extract<ReturnType<T['run']>, Ok<any, any>>['result']

const dateToken = choice([
  sequenceOf([
    yearToken,
    char('.') as Parser<'.'>,
    datePartToken,
    char('.') as Parser<'.'>,
    datePartToken
  ]),
  sequenceOf([
    datePartToken,
    char('.') as Parser<'.'>,
    datePartToken,
    char('.') as Parser<'.'>,
    yearToken
  ]),
  yearToken
])

const versionToken = sequenceOf([
  ichar('v') as Parser<'v' | 'V'>,
  digit
])

const seasonPartToken = choice(
  SEASON_PART_TERMS
    .map(istr)
) as Parser<typeof SEASON_PART_TERMS[number]>

const episodeToken = sequenceOf([
  many1(digit).map(res => res.join('')),
  many (whitespace),
  choice ([
    char('~'),
    char('-')
  ]),
  many (whitespace),
  many1(digit).map(res => res.join(''))
])

const seasonTermToken = sequenceOf([
  seasonPartToken,
  many1 (
    choice ([
      digit,
      whitespace
    ])
  )
]).map(result => regroupStrings(result).flat())

const nonDelimitedGroupToken = sequenceOf([
  char('-'),
  many1 (
    anyCharExcept (
      choice([
        char ('.'),
        whitespace
      ])
    )
  )
])

const dataTokenValue = [
  nonDelimitedGroupToken.map(res => ({ type: 'groups' as const, value: regroupStrings(res.slice(1)).flat() })),
  episodeToken.map(res => ({ type: 'episodeTerms' as const, value: res })),
]

const nonSeparatedTokenValue = [
  nonDelimitedGroupToken.map(res => ({ type: 'groups' as const, value: regroupStrings(res.slice(1)).flat() })),
  versionToken.map(res => ({ type: 'versionTerms' as const, value: res })),
  containerTermToken.map(res => ({ type: 'containerTerms' as const, value: res })),
]

const metadataTokenValue = [
  versionToken.map(res => ({ type: 'versionTerms' as const, value: res })),
  typeTermToken.map(res => ({ type: 'typeTerms' as const, value: res })),
  audioCodecToken.map(res => ({ type: 'audioCodecTerms' as const, value: res })),
  audioTermToken.map(res => ({ type: 'audioTerms' as const, value: res })),
  containerTermToken.map(res => ({ type: 'containerTerms' as const, value: res })),
  videoCodecToken.map(res => ({ type: 'videoCodecTerms' as const, value: res })),
  videoTermToken.map(res => ({ type: 'videoTerms' as const, value: res })),
  resolutionToken.map(res => ({ type: 'resolutionTerms' as const, value: res })),
  batchTermToken.map(res => ({ type: 'batchTerms' as const, value: res })),
  subtitleTermToken.map(res => ({ type: 'subtitleTerms' as const, value: res })),
  // todo: make a system that takes all terms, sort them by length, apply them, and re-categorize them back to prevent issues with small terms overriding longer ones
  // Subtitle language token needs to be higher than language tokens as it generally has longer matching tokens than language
  seasonTermToken.map(res => ({ type: 'seasonTerms' as const, value: res })),
  subtitleLanguageTermsToken.map(res => ({ type: 'subtitleLanguageTerms' as const, value: res })),
  audioLanguageTermsToken.map(res => ({ type: 'audioLanguageTerms' as const, value: res })),
  sourceTermsToken.map(res => ({ type: 'sourceTerms' as const, value: res })),
  // Date token needs to be furthest down as it can override other tokens like resolutions
  dateToken.map(res => ({ type: 'dates' as const, value: res }))
] as const

const makeDelimitedMetadataToken = <T extends Delimiter>(delimiter: T) =>
  sequenceOf ([
    char (delimiter) as Parser<Delimiter>,
    choice([
      sequenceOf([
        (choice as typeof _choice) ([...metadataTokenValue]),
        many (
          choice([
            many1 (
              sequenceOf([
                many1 (whitespace),
                (choice as typeof _choice) ([
                  ...metadataTokenValue,
                  anyCharExcept (char (getCorrespondingDelimiter(delimiter)))
                ]),
                lookAhead (
                  choice ([
                    many1 (whitespace),
                    char (getCorrespondingDelimiter(delimiter))
                  ])
                )
              ]).map(result => result[1])
            ),
            anyCharExcept (char (getCorrespondingDelimiter(delimiter)))
          ]),
        ).map(result => result[0]),
      ]).map(result => result.flat()),
      many (anyCharExcept (char (getCorrespondingDelimiter(delimiter))))
    ]),
    char (getCorrespondingDelimiter(delimiter)) as Parser<CorrespondDelimiter<Delimiter>>
  ]).map((result) => ({
    type: 'METADATA' as const,
    delimiter,
    value: regroupStrings(result).slice(1, -1).flat()
  }))

const nonDelimitedMetadataToken =
  choice([
    sequenceOf ([
      nonDelimitedGroupToken.map(res => ({ type: 'groups' as const, value: regroupStrings(res.slice(1)).flat() })),
      lookAhead (many (whitespace))
    ]),
    sequenceOf ([
      whitespace,
      (choice as typeof _choice) ([
        ...metadataTokenValue,
        ...dataTokenValue,
      ]),
      lookAhead (many (whitespace))
    ]),
    sequenceOf ([
      (choice as typeof _choice) ([
        ...nonSeparatedTokenValue
      ])
    ])
  ])
    .map((result) => ({
      type: 'METADATA' as const,
      value:
        Array.isArray(result)
          ? result
          : [result]
    }))

const metadataToken =
  choice (
    [
      ...delimitersArray.map(makeDelimitedMetadataToken),
      nonDelimitedMetadataToken,
    ]
  )  as Parser<
    ExtractParserResult<ReturnType<typeof makeDelimitedMetadataToken>>
    | ExtractParserResult<typeof nonDelimitedMetadataToken>
  >

const nonMetadataToken =
  everyCharUntil ( choice ([metadataToken, endOfInput]))
    .map(result => ({
      type: 'DATA' as const,
      value: result
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

// https://javascript.info/regexp-unicode
const nonWordStrings = /[\p{S}\p{P}\p{Z}\p{C}]/gu

const trimNonWordStrings = /^[\p{S}\p{P}\p{Z}\p{C}]*(.*?)[\p{S}\p{P}\p{Z}\p{C}]*$/u

const parser =
  many1 (token)
    .map((_tokens) => {
      const [_firstToken, ...restTokens] = _tokens

      // console.log('_tokens', ..._tokens)

      const firstToken =
        (_firstToken?.type === 'METADATA'
        && Array.isArray(_firstToken.value)
        && _firstToken.value.length === 1
        && typeof _firstToken.value[0] === 'string')
          ? { ..._firstToken, value: [{ type: 'groups' as const, value: _firstToken.value[0] }] }
          : _firstToken

      const tokens = [firstToken, ...restTokens]

      const dataTokens =
        pipe(
          tokens,
          filter((token): token is typeof token & { type: 'DATA' } =>
            Boolean(
              token
              && 'type' in token
              && token.type === 'DATA'
            )
          ),
          filter(token =>
            typeof token.value === 'string'
              ? !!token.value.trim().length
              : true
          ),
          filter(token => token.value.replaceAll(nonWordStrings, '').length >= 1),
          map(token => ({
            type: 'titles',
            value:
              typeof token.value === 'string'
                ? trimNonWordStrings.exec(token.value.trim())?.[1] ?? token.value.trim()
                : token.value
          }) as const)
        )

      const metadataTokens =
        pipe(
          tokens,
          filter((token): token is Extract<typeof token, { type: 'METADATA' }> =>
            Boolean(
              token
              && 'type' in token
              && token.type === 'METADATA'
            )
          ),
          filter(token => token.value.length >= 1)
        )

      // console.log('metadataTokens', ...metadataTokens)

      const parsedMetadata = pipe(
        metadataTokens,
        map((token) => token?.value),
        filter((token): token is typeof token & { value: any } => Boolean(token)),
        // todo: try to remove this ts-ignore
        // @ts-ignore
        flatten,
        filter(value =>
          Boolean(
            value
            && typeof value === 'object'
            && !Array.isArray(value)
          ),
        ),
        filter((token): token is Extract<typeof token, { type: string }> => typeof token === 'object')
      )

      // console.log('parsedMetadata', ...parsedMetadata)

      // todo: could try to remove that as unknown by making a properly typed groupBy or smth: https://github.com/gcanti/fp-ts/issues/797#issuecomment-477969998 ?
      const groupedResults = pipe(
        [...parsedMetadata, ...dataTokens],
        groupBy((token) => token.type),
        toEntries,
        map(([key, val]) => [key, val.map(token => token.value)]),
        // todo: try to remove this ts-ignore
        // @ts-ignore
        fromEntries
      ) as unknown as GroupBy<typeof parsedMetadata | typeof dataTokens>

      // console.log('groupedResults', groupedResults)


      return groupedResults
    })

const flatMergeStringGroups = <T extends (string | number) | (string | number)[]>(stringGroup: T) =>
  Array.isArray(stringGroup)
    ? stringGroup.join('').trim()
    : stringGroup.toString().trim()

export const parse = (str: string) => {
  const parserResult = parser.run(str)
  if (parserResult.isError) throw new Error('Parser errored')
  const { result } = parserResult
  // console.log('parser result', result)

  return {
    titles: result.titles?.map(flatMergeStringGroups),
    episodeTerms: result.episodeTerms?.map(flatMergeStringGroups),
    containerTerms: result.containerTerms?.map(flatMergeStringGroups),
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

// const res3 = parse('[EMBER] Cyberpunk: Edgerunners (2022) (Season 1) [WEBRip] [1080p Dual Audio HEVC 10 bits] (Cyberpunk Edgerunners) (Batch)')
// console.log(res3)

// const res = parse('[DKB] Cyberpunk Edgerunners - Season 01 [1080p][HEVC x265 10bit][Dual-Audio][Multi-Subs][batch]')

// const res = parse('[EMBER] Cyberpunk: Edgerunners (2022) (Season 1) [WEBRip] [1080p Dual Audio HEVC 10 bits] (Cyberpunk Edgerunners) (Batch)')
// const res = parse('[Erai-raws] Cyberpunk - Edgerunners - 01 ~ 10 [1080p]')
// console.log(res)

// console.log(format(res))
// console.log(format(res2))
