using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication2.Models;

[Table("gps", Schema = "baja")]
public class Gps
{
    [Column("session_id")]
    public long SessionId { get; set; }

    [Column("ts")]
    public DateTime Ts { get; set; }

    [Column("sensor")]
    public string Sensor { get; set; } = null!;

    [Column("lat")]
    public double? Lat { get; set; }

    [Column("lon")]
    public double? Lon { get; set; }

    [Column("alt")]
    public double? Alt { get; set; }

    // Foreign Keys
    [ForeignKey(nameof(SessionId))]
    public Session Session { get; set; } = null!;

    [ForeignKey(nameof(Sensor))]
    public Sensor SensorNav { get; set; } = null!;
}