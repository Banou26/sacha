import {
  str, sequenceOf, choice, char, many, many1,
  everyCharUntil, anythingExcept, endOfInput,
  anyChar, letters, between, anyCharExcept,
  namedSequenceOf, digits, withData, getData, whitespace, digit, mapTo, pipeParsers, Err, Ok, Parser, 
} from 'arcsecond'
import { pipe } from 'fp-ts/lib/function'
import { NonEmptyArray, groupBy, map } from 'fp-ts/lib/NonEmptyArray'
import { toEntries } from 'fp-ts/lib/Record'
import { AUDIO_CODECS, AUDIO_TERMS, RESOLUTIONS, VIDEO_CODECS, NORMALIZED_LANGUAGES, VIDEO_TERMS, TYPE_TERMS } from './common'
import { istr, ichar, nonOptionalWhitespace } from './utils'

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
    typeTermToken.map(res => ({ typeTerm: res })),
    audioCodecToken.map(res => ({ audioCodec: res })),
    audioTermToken.map(res => ({ audioTerm: res })),
    videoCodecToken.map(res => ({ videoCodec: res })),
    videoTermToken.map(res => ({ videoTerm: res })),
    resolutionToken.map(res => ({ resolution: res })),
    languageToken.map(res => ({ language: res })),
    subtitleTermToken.map(res => ({ subtitleTerm: res })),
    // needs to be furthest down as it can override other tokens like resolutions
    dateToken.map(res => ({ date: res })),
    whitespace,
    anyCharExcept (char (getCorrespondingDelimiter(delimiter)))
  ])


const makeMetadataToken = <T extends Delimiter>(delimiter: T) =>
  sequenceOf ([
    char (delimiter) as Parser<Delimiter>,
    many (metadataTokenValue (delimiter)),
    char (getCorrespondingDelimiter(delimiter)) as Parser<CorrespondDelimiter<Delimiter>>
  ]).map((result) => ({
    type: 'METADATA',
    delimiter,
    result: regroupStrings(result).slice(1, -1).flat()
  }) as const)

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
      result: result as string
    }))

const token = choice ([
  metadataToken,
  nonMetadataToken
])

type Token = ExtractParserResult<typeof token>


const parser =
  many1 (token)
    .map((result) => {
      const [_firstToken, ...restTokens] = result
      const firstToken =
        (_firstToken.type === 'METADATA'
        && _firstToken.result.length === 1
        && typeof _firstToken.result[0] === 'string')
          ? { ..._firstToken, result: [{ group: _firstToken.result[0] }] }
          : _firstToken

      const tokens = [firstToken, ...restTokens]

      console.log('tokens', tokens)

      type foo = Extract<typeof tokens[number], { type: 'METADATA' }>[][number]['result']

      const metadataTokens = 
        tokens
          .filter(({ type }) => type === 'METADATA') as Extract<typeof tokens[number], { type: 'METADATA' }>[]

      // console.log('tokens', tokens)

      const parsedMetadata =
        metadataTokens
          // @ts-ignore
          .flatMap(({ result }) => result)
          .filter(result =>
            result
            && typeof result === 'object'
            && !Array.isArray(result)
          )
        

      console.log('parsedMetadata', parsedMetadata)


      // const metadataEntries =
      //   pipe(
      //     parsedMetadata,
      //     groupBy(token => Object.keys(token)[0]),
      //     toEntries,
      // ) as unknown as NonEmptyArray<[string, Extract<TokenType['result'], object>]>

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
