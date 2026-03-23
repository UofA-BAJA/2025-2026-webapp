using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication2.Models;

[Table("vehicle", Schema = "baja")]
public class Vehicle
{
    [Key]
    [Column("name")]
    public string Name { get; set; } = null!;   // I guess the ! suppresses warnings?

    [Required]
    [Column("competition_year")]
    public int CompetitionYear{ get; set;}

}