CREATE TABLE vehicle (
    name TEXT PRIMARY KEY,
    competition_year INTEGER NOT NULL
);

CREATE TABLE session (
    id BIGSERIAL PRIMARY KEY,
    vehicle TEXT NOT NULL REFERENCES vehicle(name) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    source_file TEXT NOT NULL UNIQUE
);

CREATE INDEX session_vehicle_started_idx
    ON session (vehicle, started_at);

CREATE TABLE sensor (
    name TEXT PRIMARY KEY,
    manufacturer TEXT NOT NULL,
    model TEXT NOT NULL,
    sensor_type TEXT NOT NULL,
    description TEXT
);

CREATE TABLE log (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    vehicle TEXT NOT NULL REFERENCES vehicle(name) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT
);

CREATE INDEX log_ts_vehicle_idx
    ON log (ts, vehicle);

CREATE INDEX log_session_idx
    ON log (session_id);

CREATE TABLE imu (
    session_id BIGINT NOT NULL REFERENCES session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    vehicle TEXT NOT NULL REFERENCES vehicle(name) ON DELETE CASCADE,
    sensor TEXT NOT NULL REFERENCES sensor(name) ON DELETE CASCADE,
    ax DOUBLE PRECISION,
    ay DOUBLE PRECISION,
    az DOUBLE PRECISION,
    PRIMARY KEY (session_id, ts, vehicle, sensor)
);

CREATE INDEX imu_ts_vehicle_sensor_idx
    ON imu (ts, vehicle, sensor);

CREATE INDEX imu_session_idx
    ON imu (session_id);

CREATE TABLE gps (
    session_id BIGINT NOT NULL REFERENCES session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    vehicle TEXT NOT NULL REFERENCES vehicle(name) ON DELETE CASCADE,
    sensor TEXT NOT NULL REFERENCES sensor(name) ON DELETE CASCADE,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    alt DOUBLE PRECISION,
    PRIMARY KEY (session_id, ts, vehicle, sensor)
);

CREATE INDEX gps_ts_vehicle_sensor_idx
    ON gps (ts, vehicle, sensor);

CREATE INDEX gps_session_idx
    ON gps (session_id);

CREATE TABLE pressure (
    session_id BIGINT NOT NULL REFERENCES session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    vehicle TEXT NOT NULL REFERENCES vehicle(name) ON DELETE CASCADE,
    sensor TEXT NOT NULL REFERENCES sensor(name) ON DELETE CASCADE,
    psi DOUBLE PRECISION,
    PRIMARY KEY (session_id, ts, vehicle, sensor)
);

CREATE INDEX pressure_ts_vehicle_sensor_idx
    ON pressure (ts, vehicle, sensor);

CREATE INDEX pressure_session_idx
    ON pressure (session_id);

CREATE TABLE linear_actuator (
    session_id BIGINT NOT NULL REFERENCES session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    vehicle TEXT NOT NULL REFERENCES vehicle(name) ON DELETE CASCADE,
    sensor TEXT NOT NULL REFERENCES sensor(name) ON DELETE CASCADE,
    displacement DOUBLE PRECISION,
    PRIMARY KEY (session_id, ts, vehicle, sensor)
);

CREATE INDEX linear_actuator_ts_vehicle_sensor_idx
    ON linear_actuator (ts, vehicle, sensor);

CREATE INDEX linear_actuator_session_idx
    ON linear_actuator (session_id);

CREATE TABLE temperature (
    session_id BIGINT NOT NULL REFERENCES session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    vehicle TEXT NOT NULL REFERENCES vehicle(name) ON DELETE CASCADE,
    sensor TEXT NOT NULL REFERENCES sensor(name) ON DELETE CASCADE,
    temp DOUBLE PRECISION,
    PRIMARY KEY (session_id, ts, vehicle, sensor)
);

CREATE INDEX temperature_ts_vehicle_sensor_idx
    ON temperature (ts, vehicle, sensor);

CREATE INDEX temperature_session_idx
    ON temperature (session_id);

CREATE TABLE tachometer (
    session_id BIGINT NOT NULL REFERENCES session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    vehicle TEXT NOT NULL REFERENCES vehicle(name) ON DELETE CASCADE,
    sensor TEXT NOT NULL REFERENCES sensor(name) ON DELETE CASCADE,
    rpm DOUBLE PRECISION,
    PRIMARY KEY (session_id, ts, vehicle, sensor)
);

CREATE INDEX tachometer_ts_vehicle_sensor_idx
    ON tachometer (ts, vehicle, sensor);

CREATE INDEX tachometer_session_idx
    ON tachometer (session_id);

CREATE TABLE vehicle_state (
    session_id BIGINT NOT NULL REFERENCES session(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    vehicle TEXT NOT NULL REFERENCES vehicle(name) ON DELETE CASCADE,
    speed DOUBLE PRECISION,
    dist DOUBLE PRECISION,
    PRIMARY KEY (session_id, ts, vehicle)
);

CREATE INDEX vehicle_state_ts_vehicle_idx
    ON vehicle_state (ts, vehicle);

CREATE INDEX vehicle_state_session_idx
    ON vehicle_state (session_id);