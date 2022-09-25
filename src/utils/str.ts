import { encoder, getCharacterLength, getString, Parser, updateError, updateParserState } from 'arcsecond';

/** https://github.com/francisrstokes/arcsecond/blob/main/src/index.ts#L346 */
export function istr(s: string) {
  if (!s || getCharacterLength(s) < 1) {
      throw new TypeError(`str must be called with a string with length > 1, but got ${s}`);
  }
  const encodedStr = encoder.encode(s);
  return new Parser(function str$state(state) {
      const { index, dataView } = state;
      const remainingBytes = dataView.byteLength - index;
      if (remainingBytes < encodedStr.byteLength) {
          return updateError(state, `ParseError (position ${index}): Expecting string '${s}', but got end of input.`);
      }
      const stringAtIndex = getString(index, encodedStr.byteLength, dataView);
      return s.toLocaleLowerCase() === stringAtIndex.toLocaleLowerCase()
          ? updateParserState(state, stringAtIndex, index + encoder.encode(s).byteLength)
          : updateError(state, `ParseError (position ${index}): Expecting string '${s}', got '${stringAtIndex}...'`);
  });
}
