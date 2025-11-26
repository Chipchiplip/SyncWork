using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.Models;

[Table("ActivityLogs")]
public class ActivityLog
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid BoardId { get; set; }

    public Guid? CardId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty; // create_card, move_card, change_assignee, etc.

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public Guid UserId { get; set; }

    public string Metadata { get; set; } = "{}"; // JSON object

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("BoardId")]
    public Board Board { get; set; } = null!;

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}

