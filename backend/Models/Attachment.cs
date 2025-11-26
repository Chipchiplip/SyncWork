using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.Models;

[Table("Attachments")]
public class Attachment
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid CardId { get; set; }

    [Required]
    [MaxLength(500)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Url { get; set; } = string.Empty;

    [MaxLength(100)]
    public string MimeType { get; set; } = string.Empty;

    public long Size { get; set; }

    [Required]
    public Guid UploadedById { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("CardId")]
    public Card Card { get; set; } = null!;

    [ForeignKey("UploadedById")]
    public User UploadedBy { get; set; } = null!;
}

