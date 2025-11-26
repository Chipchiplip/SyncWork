using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.Models;

[Table("Cards")]
public class Card
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid ListId { get; set; }

    [Required]
    public Guid BoardId { get; set; }

    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int Position { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "todo"; // todo, inProgress, waitingForApproval, done, rejected

    [MaxLength(10)]
    public string? DueDate { get; set; } // YYYY-MM-DD

    public Guid? AssigneeId { get; set; }

    [MaxLength(50)]
    public string Priority { get; set; } = "medium"; // low, medium, high

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("ListId")]
    public List List { get; set; } = null!;

    [ForeignKey("BoardId")]
    public Board Board { get; set; } = null!;

    [ForeignKey("AssigneeId")]
    public User? Assignee { get; set; }

    public ICollection<ChecklistItem> ChecklistItems { get; set; } = new List<ChecklistItem>();

    public ICollection<CardLabel> CardLabels { get; set; } = new List<CardLabel>();

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
}

