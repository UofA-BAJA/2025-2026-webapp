CREATE SCHEMA IF NOT EXISTS baja AUTHORIZATION myuser;

CREATE TABLE IF NOT EXISTS baja.vehicle (
    name TEXT PRIMARY KEY,
    competition_year INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS baja.session (
    id BIGSERIAL PRIMARY KEY,
    vehicle TEXT NOT NULL REFERENCES baja.vehicle(name) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    source_file TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS session_vehicle_started_idx
    ON baja.session (vehicle, started_at);

CREATE TABLE IF NOT EXISTS baja.sensor (
    name TEXT PRIMARY KEY,
    manufacturer TEXT NOT NULL,
    model TEXT NOT NULL,
    sensor_type TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS baja.log (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES baja.session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    type TEXT NOT NULL,
    message TEXT
);

CREATE INDEX IF NOT EXISTS log_ts_vehicle_idx
    ON baja.log (ts, session_id);

CREATE INDEX IF NOT EXISTS log_session_idx
    ON baja.log (session_id);

CREATE TABLE IF NOT EXISTS baja.imu (
    session_id BIGINT NOT NULL REFERENCES baja.session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    sensor TEXT NOT NULL REFERENCES baja.sensor(name) ON DELETE CASCADE,
    ax DOUBLE PRECISION,
    ay DOUBLE PRECISION,
    az DOUBLE PRECISION,
    PRIMARY KEY (session_id, ts, sensor)
);


CREATE INDEX IF NOT EXISTS imu_session_idx
    ON baja.imu (session_id);

CREATE TABLE IF NOT EXISTS baja.gps (
    session_id BIGINT NOT NULL REFERENCES baja.session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    sensor TEXT NOT NULL REFERENCES baja.sensor(name) ON DELETE CASCADE,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    alt DOUBLE PRECISION,
    PRIMARY KEY (session_id, ts, sensor)
);

CREATE INDEX IF NOT EXISTS gps_session_idx
    ON baja.gps (session_id);

CREATE TABLE IF NOT EXISTS baja.pressure (
    session_id BIGINT NOT NULL REFERENCES baja.session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    sensor TEXT NOT NULL REFERENCES baja.sensor(name) ON DELETE CASCADE,
    psi DOUBLE PRECISION,
    PRIMARY KEY (session_id, ts, sensor)
);

CREATE INDEX IF NOT EXISTS pressure_session_idx
    ON baja.pressure (session_id);

CREATE TABLE IF NOT EXISTS baja.linear_actuator (
    session_id BIGINT NOT NULL REFERENCES baja.session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    sensor TEXT NOT NULL REFERENCES baja.sensor(name) ON DELETE CASCADE,
    displacement DOUBLE PRECISION,
    PRIMARY KEY (session_id, ts, sensor)
);


CREATE INDEX IF NOT EXISTS linear_actuator_session_idx
    ON baja.linear_actuator (session_id);

CREATE TABLE IF NOT EXISTS baja.temperature (
    session_id BIGINT NOT NULL REFERENCES baja.session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    sensor TEXT NOT NULL REFERENCES baja.sensor(name) ON DELETE CASCADE,
    temp DOUBLE PRECISION,
    PRIMARY KEY (session_id, ts, sensor)
);

CREATE INDEX IF NOT EXISTS temperature_session_idx
    ON baja.temperature (session_id);

CREATE TABLE IF NOT EXISTS baja.tachometer (
    session_id BIGINT NOT NULL REFERENCES baja.session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    sensor TEXT NOT NULL REFERENCES baja.sensor(name) ON DELETE CASCADE,
    rpm DOUBLE PRECISION,
    PRIMARY KEY (session_id, ts, sensor)
);

CREATE INDEX IF NOT EXISTS tachometer_session_idx
    ON baja.tachometer (session_id);

CREATE TABLE IF NOT EXISTS baja.vehicle_state (
    session_id BIGINT NOT NULL REFERENCES baja.session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    speed DOUBLE PRECISION,
    dist DOUBLE PRECISION,
    PRIMARY KEY (session_id, ts)
);

CREATE INDEX IF NOT EXISTS vehicle_state_session_idx
    ON baja.vehicle_state (session_id);