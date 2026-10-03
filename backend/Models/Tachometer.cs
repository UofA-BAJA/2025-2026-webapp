
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication2.Models;

[Table("tachometer", Schema = "baja")]
public class Tachometer
{
    [Column("session_id")]
    public long SessionId { get; set; }
 
    [Column("ts")]
    public DateTime Ts { get; set; }
 
    [Column("sensor")]
    public string Sensor { get; set; } = null!;
 
    [Column("rpm")]
    public double? Rpm { get; set; }

    // Foreign keys

    [ForeignKey(nameof(SessionId))]
    public Session Session { get; set; } = null!;

    [ForeignKey(nameof(Sensor))]
    public Sensor SensorNav { get; set; } = null!;
}