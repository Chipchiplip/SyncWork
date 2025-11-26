using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.Models;

[Table("BoardMembers")]
public class BoardMember
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid BoardId { get; set; }

    [Required]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Role { get; set; } = "member"; // owner, leader, member

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("BoardId")]
    public Board Board { get; set; } = null!;

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}

