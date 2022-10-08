import { test } from '@japa/runner'

import parserResults from './parser-results'

import { parse } from '../src/index'

console.log('tests', parserResults)

// test.group('Standard names', () => {

// })

test('#parse returns correct values', ({ expect }, { filename, ...parserResult }) => {
  expect(parse(filename))
    .toEqual(parserResult)
}).with(parserResults)
