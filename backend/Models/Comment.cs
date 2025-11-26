using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.Models;

[Table("Comments")]
public class Comment
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid CardId { get; set; }

    [Required]
    public Guid AuthorId { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    public string Mentions { get; set; } = string.Empty; // JSON array of user IDs

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("CardId")]
    public Card Card { get; set; } = null!;

    [ForeignKey("AuthorId")]
    public User Author { get; set; } = null!;
}

