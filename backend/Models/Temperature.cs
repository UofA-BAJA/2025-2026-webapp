using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication2.Models;

[Table("temperature", Schema = "baja")]
public class Temperature
{
    [Column("session_id")]
    public long SessionId { get; set; }

    [Column("ts")]
    public DateTime Ts { get; set; }

    [Column("sensor")]
    public string Sensor { get; set; } = null!;

    [Column("temp")]
    public double? Temp { get; set; }
    

    // Foreign Keys
    [ForeignKey(nameof(SessionId))]
    public Session Session { get; set; } = null!;

    [ForeignKey(nameof(Sensor))]
    public Sensor SensorNav { get; set; } = null!;
}