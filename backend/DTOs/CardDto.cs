namespace TaskManager.DTOs;

public class CardResponseDto
{
    public Guid Id { get; set; }
    public Guid ListId { get; set; }
    public Guid BoardId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Position { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? DueDate { get; set; }
    public UserResponseDto? Assignee { get; set; }
    public string Priority { get; set; } = string.Empty;
    public IEnumerable<LabelResponseDto> Labels { get; set; } = new List<LabelResponseDto>();
    public ChecklistProgressResponseDto ChecklistProgress { get; set; } = null!;
    public int CommentCount { get; set; }
    public int AttachmentCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCardDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Position { get; set; }
    public string? DueDate { get; set; }
    public Guid? AssigneeId { get; set; }
    public string Priority { get; set; } = "medium";
    public List<Guid>? LabelIds { get; set; }
}

public class UpdateCardDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? DueDate { get; set; }
    public Guid? AssigneeId { get; set; }
    public string? Priority { get; set; }
    public int? Position { get; set; }
}

public class MoveCardDto
{
    public Guid ListId { get; set; }
    public int Position { get; set; }
}

public class CardListResponseDto
{
    public IEnumerable<CardResponseDto> Cards { get; set; } = new List<CardResponseDto>();
    public int Total { get; set; }
}

