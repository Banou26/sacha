import { test } from '@japa/runner'

test.group('Standard names', () => {
  test('add two numbers', ({ expect }) => {
    // Test logic goes here
    expect(2 + 2).toEqual(4)
  })
})
