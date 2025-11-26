using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.Models;

[Table("ChecklistItems")]
public class ChecklistItem
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid CardId { get; set; }

    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    public bool IsCompleted { get; set; } = false;

    public int Position { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("CardId")]
    public Card Card { get; set; } = null!;
}

