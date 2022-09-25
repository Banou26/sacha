import {
  str, sequenceOf, choice, char, many, many1,
  everyCharUntil, anythingExcept, endOfInput,
  anyChar, letters, between, anyCharExcept,
  namedSequenceOf, digits, withData, getData, whitespace, digit, 
} from 'arcsecond'
import { AUDIO_CODECS, AUDIO_TERMS, RESOLUTIONS, VIDEO_CODECS, NORMALIZED_LANGUAGES, VIDEO_TERMS } from './common'
import { istr, ichar, nonOptionalWhitespace } from './utils'

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

const metadataTokenValue = (delimiter: Delimiter) =>
  choice ([
    namedSequenceOf ([
      ['date', dateToken]
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
    whitespace,
    anyCharExcept (char (getCorrespondingDelimiter(delimiter)))
  ])

const makeMetadataToken = (delimiter: Delimiter) =>
  sequenceOf ([
    char (delimiter),
    many (metadataTokenValue (delimiter)),
    char (getCorrespondingDelimiter(delimiter))
  ])

const metadataToken = choice (delimitersArray.map(makeMetadataToken))

console.log(
  JSON.stringify(
    // @ts-ignore
    metadataToken.run('(ENG FOO HEVC 1080p)').result,
    undefined,
    2
  )
)

const token = choice ([
  metadataToken,
  everyCharUntil ( choice ([metadataToken, endOfInput]))
])

const parse = many1 (token)

console.log(
  // @ts-ignore
  // parse.run('[Erai-raws] Mushoku Tensei - Isekai Ittara Honki Dasu Part 2 - Eris the Goblin Slayer [1080p][HEVC][Multiple Subtitle] [ENG][POR-BR][SPA][FRE][GER]')
  JSON.stringify(
    // @ts-ignore
    parse.run('[silly] Cyberpunk Edgerunners (WEB-DL 1080p HEVC E-AC-3) [Dual-Audio]').result,
    undefined,
    2
  )
)
// [silly] Cyberpunk Edgerunners (WEB-DL 1080p HEVC E-AC-3) [Dual-Audio]
// console.log(parse.run('[Erai-raws] Mushoku Tensei - Isekai Ittara Honki Dasu Part 2 - Eris the Goblin Slayer [1080p][HEVC][Multiple Subtitle] [ENG][POR-BR][SPA][FRE][GER]'))
