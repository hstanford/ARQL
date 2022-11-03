// comparison function for sorting values
export function compare(a: unknown, b: unknown) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  } else {
    return ('' + a).localeCompare('' + b);
  }
}
