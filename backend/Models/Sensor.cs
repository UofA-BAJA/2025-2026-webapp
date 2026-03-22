using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
 
namespace WebApplication2.Models;
 
[Table("sensor", Schema = "baja")]
public class Sensor
{
    [Key]
    [Column("name")]
    public string Name { get; set; } = null!;
 
    [Required]
    [Column("manufacturer")]
    public string Manufacturer { get; set; } = null!;
 
    [Required]
    [Column("model")]
    public string Model { get; set; } = null!;
 
    [Required]
    [Column("sensor_type")]
    public string SensorType { get; set; } = null!;
 
    [Column("description")]
    public string? Description { get; set; }
}