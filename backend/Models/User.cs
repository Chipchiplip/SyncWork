using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.Models;

[Table("Users")]
public class User
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(255)]
    public string GoogleId { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? AvatarUrl { get; set; }

    [MaxLength(100)]
    public string? TelegramChatId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastLoginAt { get; set; }

    [MaxLength(50)]
    public string Role { get; set; } = "user"; // user, admin

    // Navigation properties
    [InverseProperty("Owner")]
    public ICollection<Board> OwnedBoards { get; set; } = new List<Board>();

    [InverseProperty("Assignee")]
    public ICollection<Card> AssignedCards { get; set; } = new List<Card>();

    [InverseProperty("Author")]
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    [InverseProperty("UploadedBy")]
    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
}

