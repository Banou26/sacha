import {
  str, sequenceOf, choice, char, many, many1,
  everyCharUntil, anythingExcept, endOfInput,
  anyChar, letters, between, anyCharExcept,
  namedSequenceOf, digits, withData, getData, whitespace, digit, mapTo, pipeParsers, Err, 
} from 'arcsecond'
import { AUDIO_CODECS, AUDIO_TERMS, RESOLUTIONS, VIDEO_CODECS, NORMALIZED_LANGUAGES, VIDEO_TERMS, TYPE_TERMS } from './common'
import { istr, ichar, nonOptionalWhitespace } from './utils'

type RegroupStringPrimitive = string | { [key: string]: any }
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

const delimitersArray = Object.keys(metadataDelimiters) as Delimiter[]

const getCorrespondingDelimiter = <T extends Delimiter>(delimiter: T) => metadataDelimiters[delimiter]

const subtitleTerms = ['multiple subtitle', 'subtitle']
const subtitleTermToken = choice (
  subtitleTerms
    .map(istr)
)

const resolutionNumberToken = choice (RESOLUTIONS.map(res => str(res.toString())))

const resolutionTokenPrimitive =
  choice ([
    sequenceOf ([
      resolutionNumberToken,
      str ('px')
    ]),
    sequenceOf ([
      resolutionNumberToken,
      ichar ('p')
    ]),
    resolutionNumberToken
  ])

const resolutionToken =
  choice ([
    resolutionTokenPrimitive,
    sequenceOf ([
      resolutionTokenPrimitive,
      ichar ('x'),
      resolutionTokenPrimitive
    ])
  ])

const videoCodecToken =
  choice (
    VIDEO_CODECS
      .map(str)
  )

const videoTermToken =
  choice (
    VIDEO_TERMS
      .map(str)
  )

  // (TYPE_TERMS as Mutable<typeof TYPE_TERMS>)
const typeTermToken =
  choice (
    TYPE_TERMS
      .map(str)
  )

const audioCodecToken =
  choice (
    AUDIO_CODECS
      .map(str)
  )

const audioTermToken =
  choice (
    AUDIO_TERMS
      .map(str)
  )

const languageToken =
  choice (
    Object
      .keys(NORMALIZED_LANGUAGES)
      .map(str)
  )

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
    namedSequenceOf ([
      ['typeTerm', typeTermToken]
    ]),
    namedSequenceOf ([
      ['audioCodec', audioCodecToken]
    ]),
    namedSequenceOf ([
      ['audioTerm', audioTermToken]
    ]),
    namedSequenceOf ([
      ['videoCodec', videoCodecToken]
    ]),
    namedSequenceOf ([
      ['videoTerm', videoTermToken]
    ]),
    namedSequenceOf ([
      ['resolution', resolutionToken]
    ]),
    namedSequenceOf ([
      ['language', languageToken]
    ]),
    namedSequenceOf ([
      ['subtitleTerm', subtitleTermToken]
    ]),
    // needs to be furthest down as it can override other tokens like resolutions
    namedSequenceOf ([
      ['date', dateToken]
    ]),
    whitespace,
    anyCharExcept (char (getCorrespondingDelimiter(delimiter)))
  ])


const makeMetadataToken = (delimiter: Delimiter) =>
  pipeParsers([
    sequenceOf ([
      char (delimiter),
      many (metadataTokenValue (delimiter)),
      char (getCorrespondingDelimiter(delimiter))
    ]),
    mapTo(result => ({
      type: 'METADATA' as const,
      delimiter,
      result: regroupStrings(result).slice(1, -1).flat()
    }))
  ])


const metadataToken: ReturnType<typeof makeMetadataToken> = choice (delimitersArray.map(makeMetadataToken))


// console.log(
//   JSON.stringify(
//     // @ts-ignore
//     metadataToken.run('(ENG FOO HEVC 1080p)').result,
//     undefined,
//     2
//   )
// )

const nonMetadataToken =
  pipeParsers([
    everyCharUntil ( choice ([metadataToken, endOfInput])),
    mapTo(result => ({
      type: 'DATA' as const,
      result: result as string
    }))
  ])

const token = choice ([
  metadataToken,
  nonMetadataToken
])

type TokenType = Exclude<ReturnType<typeof token['run']>, Err<string, any>>['result']

const parser =
  pipeParsers([
    many1 (token),
    mapTo((result: TokenType[]) => {
      const [_firstToken, ...restTokens] = result
      const firstToken =
        (_firstToken.type === 'METADATA'
        && _firstToken.result.length === 1
        && typeof _firstToken.result[0] === 'string')
          ? { ..._firstToken, result: [{ group: _firstToken.result[0] }] }
          : _firstToken
      return ({
        // metadata: result.metadata,
        result: [
          firstToken,
          ...restTokens
        ]
      })
    })
  ])


// const getNamedTokens =
//   (str: tokenNames) =>
//     (token: ({ [key: tokenNames]: string }[]) => {}



// [silly] Cyberpunk Edgerunners (WEB-DL 1080p HEVC E-AC-3) [Dual-Audio]
// console.log(parse.run('[Erai-raws] Mushoku Tensei - Isekai Ittara Honki Dasu Part 2 - Eris the Goblin Slayer [1080p][HEVC][Multiple Subtitle] [ENG][POR-BR][SPA][FRE][GER]'))

export const parse = (str: string) => {
  const result = parser.run(str)
  if (result.isError) throw new Error('Parser errored')

  console.log(
    JSON.stringify(
      result.result,
      undefined,
      2
    )
  )

  const videoCodec =
    result
    .result
    // .map(token =>
    //   typeof token === 'string' ? 
    // )

  const res = {
    videoCodec
  }

  console.log(res)
  return res
}

export default parse

parse('[silly] Cyberpunk Edgerunners (WEB-DL 1080p HEVC E-AC-3) [Dual-Audio]')
// parse('[Erai-raws] Mushoku Tensei - Isekai Ittara Honki Dasu Part 2 - Eris the Goblin Slayer [1080p][HEVC][Multiple Subtitle] [ENG][POR-BR][SPA][FRE][GER]')
