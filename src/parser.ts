import {
  str, sequenceOf, choice, char, many, many1,
  everyCharUntil, anythingExcept, endOfInput,
  anyChar, letters, between, anyCharExcept,
  namedSequenceOf, digits, withData, getData, 
} from 'arcsecond'
import { COMMON_AUDIO_CODECS, COMMON_RESOLUTIONS, COMMON_VIDEO_CODECS, NORMALIZED_LANGUAGE_MAPPING } from './types'
import { istr, ichar } from './utils'

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

const resolutionNumberToken = choice (COMMON_RESOLUTIONS.map(res => str(res.toString())))

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
    COMMON_VIDEO_CODECS
      .map(str)
  )

const audioCodecToken =
  choice (
    COMMON_AUDIO_CODECS
      .map(str)
  )

const languageToken =
  choice (
    Object
      .keys(NORMALIZED_LANGUAGE_MAPPING)
      .map(str)
  )

const metadataTokenValue = (delimiter: Delimiter) =>
  choice ([
    namedSequenceOf ([
      ['audioCodec', audioCodecToken]
    ]),
    namedSequenceOf ([
      ['videoCodec', videoCodecToken]
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
    everyCharUntil (char (getCorrespondingDelimiter(delimiter)))
  ])

const makeMetadataToken = (delimiter: Delimiter) =>
  sequenceOf ([
    char (delimiter),
    metadataTokenValue (delimiter),
    // choice([
    //   many (metadataTokenValue (delimiter)),
    //   everyCharUntil (char (getCorrespondingDelimiter(delimiter)))
    // ]),
    // many (metadataTokenValue (delimiter)),
    // everyCharUntil (char (getCorrespondingDelimiter(delimiter))),
    char (getCorrespondingDelimiter(delimiter))
  ])

const metadataToken = choice (delimitersArray.map(makeMetadataToken))

// console.log(metadataToken.run('(ENG HEVC 1080p)'))

const token = choice ([
  metadataToken,
  everyCharUntil ( choice ([metadataToken, endOfInput]))
])

const parse = many1 (token)

// console.log(parse.run('(foo) bar [baz]'))
// console.log(parse.run('(foo) bar'))
console.log(
  // @ts-ignore
  // parse.run('[Erai-raws] Mushoku Tensei - Isekai Ittara Honki Dasu Part 2 - Eris the Goblin Slayer [1080p][HEVC][Multiple Subtitle] [ENG][POR-BR][SPA][FRE][GER]')
  JSON.stringify(
    // @ts-ignore
    parse.run('[Erai-raws] Mushoku Tensei - Isekai Ittara Honki Dasu Part 2 - Eris the Goblin Slayer [1080p][HEVC][Multiple Subtitle] [ENG][POR-BR][SPA][FRE][GER]').result,
    undefined,
    2
  )
)
// [silly] Cyberpunk Edgerunners (WEB-DL 1080p HEVC E-AC-3) [Dual-Audio]
// console.log(parse.run('[Erai-raws] Mushoku Tensei - Isekai Ittara Honki Dasu Part 2 - Eris the Goblin Slayer [1080p][HEVC][Multiple Subtitle] [ENG][POR-BR][SPA][FRE][GER]'))
