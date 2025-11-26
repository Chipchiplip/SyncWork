using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.Models;

[Table("AutomationRules")]
public class AutomationRule
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid BoardId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public bool Enabled { get; set; } = true;

    [Required]
    public string Trigger { get; set; } = "{}"; // JSON object

    [Required]
    public string Actions { get; set; } = "[]"; // JSON array

    public int ExecutionCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("BoardId")]
    public Board Board { get; set; } = null!;
}

