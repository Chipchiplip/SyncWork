using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.Models;

[Table("Boards")]
public class Board
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [MaxLength(50)]
    public string BackgroundType { get; set; } = "color"; // color, image

    [MaxLength(500)]
    public string BackgroundValue { get; set; } = "#0079bf";

    [Required]
    public Guid OwnerId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("OwnerId")]
    public User Owner { get; set; } = null!;

    public ICollection<List> Lists { get; set; } = new List<List>();

    public ICollection<Label> Labels { get; set; } = new List<Label>();

    public ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();

    public ICollection<AutomationRule> AutomationRules { get; set; } = new List<AutomationRule>();
}

