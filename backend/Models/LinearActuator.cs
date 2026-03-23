using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
 
namespace WebApplication2.Models;
 
[Table("linear_actuator", Schema = "baja")]
public class LinearActuator
{
    [Column("session_id")]
    public long SessionId { get; set; }
 
    [Column("ts")]
    public DateTime Ts { get; set; }
 
    [Column("sensor")]
    public string Sensor { get; set; } = null!;
 
    [Column("displacement")]
    public double? Displacement { get; set; }
 
 
    // Foreign Keys
    [ForeignKey(nameof(SessionId))]
    public Session Session { get; set; } = null!;
 
    [ForeignKey(nameof(Sensor))]
    public Sensor SensorNav { get; set; } = null!;
}