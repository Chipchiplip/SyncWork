using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.Models;

[Table("Labels")]
public class Label
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid BoardId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(7)]
    public string Color { get; set; } = "#0079bf"; // Hex color

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("BoardId")]
    public Board Board { get; set; } = null!;

    public ICollection<CardLabel> CardLabels { get; set; } = new List<CardLabel>();
}

