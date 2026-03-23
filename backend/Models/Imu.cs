using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication2.Models;

[Table("imu", Schema = "baja")]
public class Imu
{
    [Column("session_id")]
    public long SessionId { get; set; }

    [Column("ts")]
    public DateTime Ts { get; set; }

    [Column("sensor")]
    public string Sensor { get; set; } = null!;

    [Column("rx")]
    public double? Rx { get; set; }

    [Column("ry")]
    public double? Ry { get; set; }

    [Column("rz")]
    public double? Rz { get; set; }

    [Column("ax")]
    public double? Ax { get; set; }

    [Column("ay")]
    public double? Ay { get; set; }

    [Column("az")]
    public double? Az { get; set; }

    // Foreign Keys
    [ForeignKey(nameof(SessionId))]
    public Session Session { get; set; } = null!;

    [ForeignKey(nameof(Sensor))]
    public Sensor SensorNav { get; set; } = null!;
}