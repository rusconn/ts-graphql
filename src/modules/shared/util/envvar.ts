import process from "node:process";

export function get(key: string) {
  const val = process.env[key];
  if (val == null) {
    throw new Error(`${key} not set`);
  }

  return val;
}

export function getOr(key: string, defaultValue: string) {
  return process.env[key] ?? defaultValue;
}

export function getInt(key: string) {
  const val = get(key).trim();
  if (val === "") {
    throw new Error(`${key} must not be empty`);
  }

  const num = Number(val);
  if (!Number.isInteger(num)) {
    throw new Error(`${key} must be an integer`);
  }

  return num;
}

export function getFloat(key: string) {
  const val = get(key).trim();
  if (val === "") {
    throw new Error(`${key} must not be empty`);
  }

  const num = Number(val);
  if (!Number.isFinite(num)) {
    throw new Error(`${key} must be a finite number`);
  }

  return num;
}

export function getFloatOr(key: string, defaultValue: number) {
  const val = process.env[key];
  if (val == null) return defaultValue;

  const trimmed = val.trim();
  if (trimmed === "") return defaultValue;

  const num = Number(trimmed);
  if (!Number.isFinite(num)) {
    throw new Error(`${key} must be a finite number`);
  }

  return num;
}

export function getBool(key: string) {
  const val = get(key).trim();
  if (val !== "true" && val !== "false") {
    throw new Error(`${key} must be "true" or "false"`);
  }

  return val === "true";
}
