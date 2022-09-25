import {
  str, sequenceOf, choice, char, many, many1,
  everyCharUntil, anythingExcept, endOfInput,
  anyChar, letters, between, anyCharExcept,
  namedSequenceOf, digits
} from 'arcsecond'

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

const metadataTokenValue = (delimiter: Delimiter) =>
  choice ([
    namedSequenceOf([
      ['resolution', digits]
    ]),
    everyCharUntil (char (getCorrespondingDelimiter(delimiter)))
  ])

const makeMetadataToken = (delimiter: Delimiter) =>
  sequenceOf([
    char (delimiter),
    // many (anyCharExcept (char (getCorrespondingDelimiter(delimiter)))),
    // many ( choice ([
    //   anyCharExcept (char (getCorrespondingDelimiter(delimiter)))
    // ])),
    many ( choice ([
      everyCharUntil (char (getCorrespondingDelimiter(delimiter)))
    ])),
    // everyCharUntil (char (getCorrespondingDelimiter(delimiter))),
    char (getCorrespondingDelimiter(delimiter))
  ])

const metadataToken = choice (delimitersArray.map(makeMetadataToken))

const token = choice ([
  metadataToken,
  everyCharUntil ( choice ([metadataToken, endOfInput]))
])

const parse = many (token)

// console.log(parse.run('(foo) bar [baz]'))
// console.log(parse.run('(foo) bar'))
// @ts-ignore
console.log(parse.run('[silly] Cyberpunk Edgerunners (WEB-DL 1080p HEVC E-AC-3) [Dual-Audio]').result)
// console.log(parse.run('[Erai-raws] Mushoku Tensei - Isekai Ittara Honki Dasu Part 2 - Eris the Goblin Slayer [1080p][HEVC][Multiple Subtitle] [ENG][POR-BR][SPA][FRE][GER]'))
