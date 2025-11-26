namespace TaskManager.DTOs;

public class BoardResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public BackgroundDto Background { get; set; } = null!;
    public Guid OwnerId { get; set; }
    public string? UserRole { get; set; }
    public int MemberCount { get; set; }
    public int ListCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class BackgroundDto
{
    public string Type { get; set; } = "color";
    public string Value { get; set; } = "#0079bf";
}

public class CreateBoardDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public BackgroundDto? Background { get; set; }
}

public class UpdateBoardDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public BackgroundDto? Background { get; set; }
}

public class BoardListResponseDto
{
    public IEnumerable<BoardResponseDto> Boards { get; set; } = new List<BoardResponseDto>();
    public int Total { get; set; }
    public int Limit { get; set; }
    public int Offset { get; set; }
}

