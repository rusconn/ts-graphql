export class ParseErr extends Error {
  field: string;

  static {
    ParseErr.prototype.name = "ParseErr";
  }

  constructor(field: string, message: string, options?: ErrorOptions) {
    super(message, options);
    this.field = field;
  }
}

export function stringTooShortError(argName: string, min: number) {
  return new ParseErr(argName, `The ${argName} is below the minimum number of ${min} characters.`);
}

export function stringTooLongError(argName: string, max: number) {
  return new ParseErr(argName, `The ${argName} exceeds the maximum number of ${max} characters.`);
}

export function stringTooLargeError(argName: string) {
  return new ParseErr(argName, `The ${argName} is too large.`);
}
