using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication2.Models;

[Table("vehicle_state", Schema = "baja")]
public class VehicleState
{
    [Column("session_id")]
    public long SessionId { get; set; }

    [Column("ts")]
    public DateTime Ts { get; set; }

    [Column("speed")]
    public double? Speed { get; set; }

    [Column("dist")]
    public double? Dist { get; set; }

    // Foreign Keys
    [ForeignKey(nameof(SessionId))]
    public Session Session { get; set; } = null!;
}