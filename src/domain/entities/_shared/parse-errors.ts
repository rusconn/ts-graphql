export type StringLengthTooShortError = ReturnType<typeof stringLengthTooShortError>;

export function stringLengthTooShortError(min: number) {
  return {
    type: "too short",
    min,
  } as const;
}

export type StringLengthTooLongError = ReturnType<typeof stringLengthTooLongError>;

export function stringLengthTooLongError(max: number) {
  return {
    type: "too long",
    max,
  } as const;
}

export type StringSizeTooLargeError = ReturnType<typeof stringSizeTooLargeError>;

export function stringSizeTooLargeError(max: number) {
  return {
    type: "size too large",
    max,
  } as const;
}

export type InvalidFormatError = typeof invalidFormatError;

export const invalidFormatError = {
  type: "invalid format",
} as const;
