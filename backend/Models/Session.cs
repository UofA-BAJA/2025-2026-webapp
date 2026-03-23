using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication2.Models;

[Table("session", Schema = "baja")]
public class Session
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Required]
    [Column("vehicle")]
    public string Vehicle { get; set; } = null!;

    [Required]
    [Column("started_at")]
    public DateTime StartedAt { get; set;}

    [Required]
    [Column("source_file")]
    public string SourceFile { get; set; } = null!;

    [ForeignKey(nameof(Vehicle))]
    public Sensor VehicleNav { get; set; } = null!;
}