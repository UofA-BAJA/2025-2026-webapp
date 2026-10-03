using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication2.Models;

[Table("pressure", Schema = "baja")]
public class Pressure
{
    [Column("session_id")]
    public long SessionId { get; set; }

    [Column("ts")]
    public DateTime Ts { get; set; }

    [Column("sensor")]
    public string Sensor { get; set; } = null!;

    [Column("psi")]
    public double? Psi { get; set; }

    // Foreign Keys
    [ForeignKey(nameof(SessionId))]
    public Session Session { get; set; } = null!;

    [ForeignKey(nameof(Sensor))]
    public Sensor SensorNav { get; set; } = null!;
}