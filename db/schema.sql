CREATE DOMAIN uuidv7 AS uuid
CHECK (value IS NULL OR uuid_extract_version(value) = 7);

CREATE TYPE todo_status AS ENUM ('done', 'pending');

CREATE TABLE users (
  id uuidv7 PRIMARY KEY,
  name text NOT NULL,
  email varchar(100) NOT NULL UNIQUE,
  created_at timestamptz (3) NOT NULL,
  updated_at timestamptz (3) NOT NULL
);
CREATE INDEX ON users (created_at, id);
CREATE INDEX ON users (updated_at, id);

CREATE TABLE credentials (
  user_id uuidv7 PRIMARY KEY REFERENCES users ON UPDATE RESTRICT ON DELETE CASCADE,
  password varchar(255) NOT NULL
);

CREATE TABLE refresh_tokens (
  token varchar(64) PRIMARY KEY,
  user_id uuidv7 NOT NULL REFERENCES users ON UPDATE RESTRICT ON DELETE RESTRICT,
  expires_at timestamptz (3) NOT NULL,
  created_at timestamptz (3) NOT NULL
);
CREATE INDEX ON refresh_tokens (user_id, created_at);

CREATE TABLE todos (
  id uuidv7 PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  status todo_status NOT NULL,
  user_id uuidv7 NOT NULL REFERENCES users ON UPDATE RESTRICT ON DELETE RESTRICT,
  created_at timestamptz (3) NOT NULL,
  updated_at timestamptz (3) NOT NULL
);
CREATE INDEX ON todos (user_id, created_at, id);
CREATE INDEX ON todos (user_id, updated_at, id);
CREATE INDEX todos_title_bigm ON todos
USING gin (LOWER(title) gin_bigm_ops);
CREATE INDEX todos_description_bigm ON todos
USING gin (LOWER(description) gin_bigm_ops);
