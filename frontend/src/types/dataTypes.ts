export type DataTypeKey =
  // WHEEL_RPM (0x01)
  | "wheel_rpm_front_left"
  | "wheel_rpm_front_right"
  | "wheel_rpm_rear"
  // CAR_STATE (0x02)
  | "car_state_distance"
  | "car_state_speed"
  // MOTOR_RPM (0x03)
  | "motor_rpm"
  // IMU_ROTATION (0x04)
  | "imu_rotation_x"
  | "imu_rotation_y"
  | "imu_rotation_z"
  // IMU_ACCELERATION (0x05)
  | "imu_acceleration_x"
  | "imu_acceleration_y"
  | "imu_acceleration_z"
  // BRAKE_PRESSURE (0x06)
  | "brake_pressure_front"
  | "brake_pressure_rear"
  // SHOCK_DISPLACEMENT (0x07)
  | "shock_displacement_front_left"
  | "shock_displacement_front_right"
  | "shock_displacement_rear"
  // CVT_TEMPERATURE (0x08)
  | "cvt_temperature"
  // GPS_POSITION (0x09)
  | "gps_longitude"
  | "gps_latitude"
  | "gps_altitude"
  // ERRORS (0xAA)
  | "error_code";

export interface DataTypeConfig {
  label: string;
  typeCode: number;
  fieldIndex: number;
}

export const DATA_TYPE_MAP: Record<DataTypeKey, DataTypeConfig> = {
  // ── WHEEL_RPM (0x01) ─────────────────────────────────────────────────────
  wheel_rpm_front_left:           { label: "Wheel RPM Front Left",           typeCode: 0x01, fieldIndex: 0 },
  wheel_rpm_front_right:          { label: "Wheel RPM Front Right",          typeCode: 0x01, fieldIndex: 1 },
  wheel_rpm_rear:                 { label: "Wheel RPM Rear",                 typeCode: 0x01, fieldIndex: 2 },

  // ── CAR_STATE (0x02) ─────────────────────────────────────────────────────
  car_state_distance:             { label: "Car State Distance",             typeCode: 0x02, fieldIndex: 0 },
  car_state_speed:                { label: "Car State Speed",                typeCode: 0x02, fieldIndex: 1 },

  // ── MOTOR_RPM (0x03) ─────────────────────────────────────────────────────
  motor_rpm:                      { label: "Motor RPM",                      typeCode: 0x03, fieldIndex: 0 },

  // ── IMU_ROTATION (0x04) ───────────────────────────────────────────────────
  imu_rotation_x:                 { label: "IMU Rotation X",                 typeCode: 0x04, fieldIndex: 0 },
  imu_rotation_y:                 { label: "IMU Rotation Y",                 typeCode: 0x04, fieldIndex: 1 },
  imu_rotation_z:                 { label: "IMU Rotation Z",                 typeCode: 0x04, fieldIndex: 2 },

  // ── IMU_ACCELERATION (0x05) ───────────────────────────────────────────────
  imu_acceleration_x:             { label: "IMU Acceleration X",             typeCode: 0x05, fieldIndex: 0 },
  imu_acceleration_y:             { label: "IMU Acceleration Y",             typeCode: 0x05, fieldIndex: 1 },
  imu_acceleration_z:             { label: "IMU Acceleration Z",             typeCode: 0x05, fieldIndex: 2 },

  // ── BRAKE_PRESSURE (0x06) ─────────────────────────────────────────────────
  brake_pressure_front:           { label: "Brake Pressure Front",           typeCode: 0x06, fieldIndex: 0 },
  brake_pressure_rear:            { label: "Brake Pressure Rear",            typeCode: 0x06, fieldIndex: 1 },

  // ── SHOCK_DISPLACEMENT (0x07) ─────────────────────────────────────────────
  shock_displacement_front_left:  { label: "Shock Displacement Front Left",  typeCode: 0x07, fieldIndex: 0 },
  shock_displacement_front_right: { label: "Shock Displacement Front Right", typeCode: 0x07, fieldIndex: 1 },
  shock_displacement_rear:        { label: "Shock Displacement Rear",        typeCode: 0x07, fieldIndex: 2 },

  // ── CVT_TEMPERATURE (0x08) ────────────────────────────────────────────────
  cvt_temperature:                { label: "CVT Temperature",                typeCode: 0x08, fieldIndex: 0 },

  // ── GPS_POSITION (0x09) ───────────────────────────────────────────────────
  gps_longitude:                  { label: "GPS Longitude",                  typeCode: 0x09, fieldIndex: 0 },
  gps_latitude:                   { label: "GPS Latitude",                   typeCode: 0x09, fieldIndex: 1 },
  gps_altitude:                   { label: "GPS Altitude",                   typeCode: 0x09, fieldIndex: 2 },

  // ── ERRORS (0xAA) ─────────────────────────────────────────────────────────
  error_code:                     { label: "Error Code",                     typeCode: 0xAA, fieldIndex: 0 },
};