export function assertNoError<T extends { isError: boolean }>(
  result: T
): asserts result is T & { isError: false } {
  expect(result.isError).toBe(false);
}
