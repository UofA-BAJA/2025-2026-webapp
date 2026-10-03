using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication2.Models;

[Table("log", Schema = "baja")]
public class Log
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Required]
    [Column("session_id")]
    public long SessionId { get; set; }

    [Column("ts")]
    public DateTime Ts { get; set; }

    [Required]
    [Column("type")]
    public string Type { get; set; } = null!;

    [Column("message")]
    public string? Message { get; set; }

    // Foreign Keys
    [ForeignKey(nameof(SessionId))]
    public Session Session { get; set; } = null!;
}