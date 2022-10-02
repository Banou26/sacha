import {
  str, sequenceOf, choice, char, many, many1,
  everyCharUntil, anythingExcept, endOfInput,
  anyChar, letters, between, anyCharExcept,
  namedSequenceOf, digits, withData, getData, whitespace, digit, mapTo, pipeParsers, Err, Ok, Parser, 
} from 'arcsecond'
import { AUDIO_CODECS, AUDIO_TERMS, RESOLUTIONS, VIDEO_CODECS, NORMALIZED_LANGUAGES, VIDEO_TERMS, TYPE_TERMS } from './common'
import { istr, ichar, nonOptionalWhitespace } from './utils'

import { Semigroup } from 'fp-ts/lib/string'
import { contramap } from 'fp-ts/lib/Eq'
import { array, Foldable, every, flatten } from 'fp-ts/lib/Array'
import { last } from 'fp-ts/lib/Semigroup'
import * as RA from 'fp-ts/lib/ReadonlyArray'
import { NonEmptyArray, groupBy } from 'fp-ts/lib/NonEmptyArray'
import { map } from 'fp-ts/lib/Array'
import { fromEntries, toEntries } from 'fp-ts/lib/Record'
import { filter } from 'fp-ts/lib/Array'
import { identity, pipe } from 'fp-ts/lib/function'
import { fromFoldableMap, ReadonlyRecord } from 'fp-ts/lib/ReadonlyRecord'

type RegroupStringPrimitive = string | number | { [key: string]: any }
type RegroupStringPart<S extends RegroupStringPrimitive> = S | S[]
export type RegroupString = RegroupStringPart<RegroupStringPart<RegroupStringPrimitive>>

const regroupStrings = <T extends RegroupString>(tokens: T[]): T[] =>
  tokens
    .reduce<T[]>((acc, token) => {
      if (!acc.length) return [...acc, token]
      const rest = acc.slice(0, -1)
      const previousToken = acc.at(-1)
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

const subtitleTerms = ['multiple subtitle', 'subtitle'] as const
const subtitleTermToken = choice (
  subtitleTerms
    .map(istr)
) as Parser<typeof subtitleTerms[number]>

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

const languageToken =
  choice (
    Object
      .keys(NORMALIZED_LANGUAGES)
      .map(str)
  ) as Parser<keyof typeof NORMALIZED_LANGUAGES>

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

const test = choice([
  yearToken,
  datePartToken
])

const res = test.run('10')

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

type tokenNames =
  'date'
  | 'audioCodec'
  | 'audioTerm'
  | 'videoCodec'
  | 'videoTerm'
  | 'resolution'
  | 'language'
  | 'subtitleTerm'

const metadataTokenValue = (delimiter: Delimiter) =>
  choice ([
    typeTermToken.map(res => ({ type: 'typeTerm' as const, value: res })),
    audioCodecToken.map(res => ({ type: 'audioCodec' as const, value: res })),
    audioTermToken.map(res => ({ type: 'audioTerm' as const, value: res })),
    videoCodecToken.map(res => ({ type: 'videoCodec' as const, value: res })),
    videoTermToken.map(res => ({ type: 'videoTerm' as const, value: res })),
    resolutionToken.map(res => ({ type: 'resolution' as const, value: res })),
    languageToken.map(res => ({ type: 'language' as const, value: res })),
    subtitleTermToken.map(res => ({ type: 'subtitleTerm' as const, value: res })),
    // needs to be furthest down as it can override other tokens like resolutions
    dateToken.map(res => ({ type: 'date' as const, value: res })),
    whitespace,
    anyCharExcept (char (getCorrespondingDelimiter(delimiter)))
  ])


const makeMetadataToken = <T extends Delimiter>(delimiter: T) =>
  sequenceOf ([
    char (delimiter) as Parser<Delimiter>,
    many (metadataTokenValue (delimiter)),
    char (getCorrespondingDelimiter(delimiter)) as Parser<CorrespondDelimiter<Delimiter>>
  ]).map((result) => ({
    type: 'METADATA' as const,
    delimiter,
    value: regroupStrings(result).slice(1, -1).flat()
  }))

  // : [T, ExtractParserResult<ReturnType<typeof metadataTokenValue>>, CorrespondDelimiter<T>]


const metadataToken =
  choice (
    delimitersArray
      .map(makeMetadataToken)
  ) as Parser<ExtractParserResult<ReturnType<typeof makeMetadataToken>>>

// const metadataToken: ReturnType<typeof makeMetadataToken> =
//   choice (delimitersArray.map(makeMetadataToken))


// console.log(
//   JSON.stringify(
//     // @ts-ignore
//     metadataToken.run('(ENG FOO HEVC 1080p)').result,
//     undefined,
//     2
//   )
// )

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

type RootToken = ExtractParserResult<typeof token>
type MetadataToken = Exclude<Extract<RootToken, { type: 'METADATA' }>['value'][number], string | number>

type Token = RootToken | MetadataToken

type TokenResult = {
  type: string
  value: any
}

type GroupBy<T extends TokenResult[]> = {
  [K in T[number]['type']]:
    Extract<T[number], { type: K }>['value']
    | Extract<T[number], { type: K }>['value'][]
}

const parser =
  many1 (token)
    .map((_tokens) => {
      const [_firstToken, ...restTokens] = _tokens
      const firstToken =
        (_firstToken.type === 'METADATA'
        && _firstToken.value.length === 1
        && typeof _firstToken.value[0] === 'string')
          ? { ..._firstToken, value: [{ type: 'group' as const, value: _firstToken.value[0] }] }
          : _firstToken

      const tokens = [firstToken, ...restTokens]

      const metadataTokens =
        pipe(
          tokens,
          filter(token => token.type === 'METADATA')
        )

      const parsedMetadata = pipe(
        metadataTokens
        .map(({ value }) => value)
        .flat()
        .filter(value =>
          value
          && typeof value === 'object'
          && !Array.isArray(value),
        ),
        filter((token): token is Extract<typeof token, { type: string }> => typeof token === 'object')
      )

      console.log('parsedMetadata', parsedMetadata)

      // todo: could try to remove that as unknown by making a properly typed groupBy or smth: https://github.com/gcanti/fp-ts/issues/797#issuecomment-477969998 ?
      const groupedResults = pipe(
        parsedMetadata,
        groupBy((token) => token.type),
        toEntries,
        map(([key, val]) => [key, val.map(token => token.value)]),
        // @ts-ignore
        fromEntries
      ) as unknown as GroupBy<typeof parsedMetadata>
      console.log('groupedResults', groupedResults)

      // const metadataEntries =
      //   pipe(
      //     parsedMetadata,
      //     filter((token): token is Extract<typeof token, { type: string }> => typeof token === 'object'),
      //     val => {
      //       const result = groupBy((token: typeof val[number]) => token.type)(val)

      //       return result as Record<typeof val[number]['type'], typeof val[number]>
      //     },
      //     // groupBy(token => Object.keys(token)[0]),
      //     value => toEntries(value) as Entries<typeof value>,
      //     map(([key, group]) => [key, group.map(token => token[key])]),
      //     // fromEntries
      // ) // as unknown as NonEmptyArray<[string, Extract<TokenType['result'], object>]>

      // console.log('metadataEntries', metadataEntries)

      // const metadata = pipe(
      //   metadataEntries,
      //   map(([key, group]) => group.map(token => token[key]))
      // )

      // console.log('metadata', metadata)
      
      return ({
        // metadata,
        result: tokens
      })
    })


// const getNamedTokens =
//   (str: tokenNames) =>
//     (token: ({ [key: tokenNames]: string }[]) => {}



// [silly] Cyberpunk Edgerunners (WEB-DL 1080p HEVC E-AC-3) [Dual-Audio]
// console.log(parse.run('[Erai-raws] Mushoku Tensei - Isekai Ittara Honki Dasu Part 2 - Eris the Goblin Slayer [1080p][HEVC][Multiple Subtitle] [ENG][POR-BR][SPA][FRE][GER]'))

export const parse = (str: string) => {
  const result = parser.run(str)
  if (result.isError) throw new Error('Parser errored')

  // console.log(
  //   JSON.stringify(
  //     result.result,
  //     undefined,
  //     2
  //   )
  // )

  const videoCodec =
    result
    .result
    // .map(token =>
    //   typeof token === 'string' ? 
    // )

  const res = {
    videoCodec
  }

  // console.log(res)
  return res
}

export default parse

parse('[silly] Cyberpunk Edgerunners (WEB-DL 1080p HEVC E-AC-3) [Dual-Audio]')
// parse('[Erai-raws] Mushoku Tensei - Isekai Ittara Honki Dasu Part 2 - Eris the Goblin Slayer [1080p][HEVC][Multiple Subtitle] [ENG][POR-BR][SPA][FRE][GER]')
