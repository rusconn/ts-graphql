export class UserNotFoundError extends Error {
  static {
    UserNotFoundError.prototype.name = "UserNotFoundError";
  }
}

export function userNotFoundError() {
  return new UserNotFoundError();
}
