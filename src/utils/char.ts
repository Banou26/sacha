import { getCharacterLength, getNextCharWidth, getUtf8Char, Parser, updateError, updateParserState } from 'arcsecond';

/** https://github.com/francisrstokes/arcsecond/blob/main/src/index.ts#L283 */
export const ichar = function char(c: string) {
  if (!c || getCharacterLength(c) !== 1) {
      throw new TypeError(`char must be called with a single character, but got ${c}`);
  }
  return new Parser(function char$state(state) {
      if (state.isError)
          return state;
      const { index, dataView } = state;
      if (index < dataView.byteLength) {
          const charWidth = getNextCharWidth(index, dataView);
          if (index + charWidth <= dataView.byteLength) {
              const char = getUtf8Char(index, charWidth, dataView);
              return char.toLocaleLowerCase() === c.toLocaleLowerCase()
                  ? updateParserState(state, char, index + charWidth)
                  : updateError(state, `ParseError (position ${index}): Expecting character '${c}', got '${char}'`);
          }
      }
      return updateError(state, `ParseError (position ${index}): Expecting character '${c}', but got end of input.`);
  });
};