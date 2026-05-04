export type DataTypeKey =
  | "wheel_rpm_front_left"
  | "wheel_rpm_front_right"
  | "wheel_rpm_rear"
  | "car_state_distance"
  | "car_state_speed"
  | "motor_rpm"
  | "imu_rotation_x"
  | "imu_rotation_y"
  | "imu_rotation_z"
  | "imu_acceleration_x"
  | "imu_acceleration_y"
  | "imu_acceleration_z"
  | "brake_pressure_front"
  | "brake_pressure_rear"
  | "shock_displacement_front_left"
  | "shock_displacement_front_right"
  | "shock_displacement_rear"
  | "cvt_temperature"
  | "gps_longitude"
  | "gps_latitude"
  | "gps_altitude"
  | "error_code";

export interface DataTypeConfig {
  label: string;
}

export const DATA_TYPE_MAP: Record<DataTypeKey, DataTypeConfig> = {
  wheel_rpm_front_left:           { label: "Wheel RPM Front Left"           },
  wheel_rpm_front_right:          { label: "Wheel RPM Front Right"          },
  wheel_rpm_rear:                 { label: "Wheel RPM Rear"                 },
  car_state_distance:             { label: "Car State Distance"             },
  car_state_speed:                { label: "Car State Speed"                },
  motor_rpm:                      { label: "Motor RPM"                      },
  imu_rotation_x:                 { label: "IMU Rotation X"                 },
  imu_rotation_y:                 { label: "IMU Rotation Y"                 },
  imu_rotation_z:                 { label: "IMU Rotation Z"                 },
  imu_acceleration_x:             { label: "IMU Acceleration X"             },
  imu_acceleration_y:             { label: "IMU Acceleration Y"             },
  imu_acceleration_z:             { label: "IMU Acceleration Z"             },
  brake_pressure_front:           { label: "Brake Pressure Front"           },
  brake_pressure_rear:            { label: "Brake Pressure Rear"            },
  shock_displacement_front_left:  { label: "Shock Displacement Front Left"  },
  shock_displacement_front_right: { label: "Shock Displacement Front Right" },
  shock_displacement_rear:        { label: "Shock Displacement Rear"        },
  cvt_temperature:                { label: "CVT Temperature"                },
  gps_longitude:                  { label: "GPS Longitude"                  },
  gps_latitude:                   { label: "GPS Latitude"                   },
  gps_altitude:                   { label: "GPS Altitude"                   },
  error_code:                     { label: "Error Code"                     },
};