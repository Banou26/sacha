
export const extractArray = <T extends any>(arr: T[]) =>
  Array.isArray(arr) && arr.length === 1
    ? arr[0]
    : arr
