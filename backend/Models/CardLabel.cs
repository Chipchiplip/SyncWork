using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.Models;

[Table("CardLabels")]
public class CardLabel
{
    [Required]
    public Guid CardId { get; set; }

    [Required]
    public Guid LabelId { get; set; }

    // Navigation properties
    [ForeignKey("CardId")]
    public Card Card { get; set; } = null!;

    [ForeignKey("LabelId")]
    public Label Label { get; set; } = null!;
}

