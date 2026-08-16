import * as env from "../util/envvar.ts";

const transport = env.get("MAILER_TRANSPORT");
if (transport !== "console" && transport !== "smtp") {
  throw new Error(`MAILER_TRANSPORT must be "console" or "smtp"`);
}
export const mailerTransport = transport;

export const smtpConfig = {
  host: env.get("SMTP_HOST"),
  port: env.getInt("SMTP_PORT"),
  user: env.get("SMTP_USER"),
  password: env.get("SMTP_PASSWORD"),
  from: env.get("SMTP_FROM"),
};
