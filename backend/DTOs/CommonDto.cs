namespace TaskManager.DTOs;

public class ChecklistProgressResponseDto
{
    public int Total { get; set; }
    public int Completed { get; set; }
    public double Percentage { get; set; }
}

public class LabelResponseDto
{
    public Guid Id { get; set; }
    public Guid BoardId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateLabelDto
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#0079bf";
}

public class UpdateLabelDto
{
    public string? Name { get; set; }
    public string? Color { get; set; }
}

public class ListResponseDto
{
    public Guid Id { get; set; }
    public Guid BoardId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Position { get; set; }
    public int CardCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateListDto
{
    public string Name { get; set; } = string.Empty;
    public int Position { get; set; }
}

public class UpdateListDto
{
    public string? Name { get; set; }
    public int? Position { get; set; }
}

public class ReorderListsDto
{
    public List<Guid> ListIds { get; set; } = new List<Guid>();
}

public class ChecklistItemResponseDto
{
    public Guid Id { get; set; }
    public Guid CardId { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public int Position { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateChecklistItemDto
{
    public string Title { get; set; } = string.Empty;
    public int Position { get; set; }
}

public class UpdateChecklistItemDto
{
    public string? Title { get; set; }
    public int? Position { get; set; }
}

public class CommentResponseDto
{
    public Guid Id { get; set; }
    public Guid CardId { get; set; }
    public string Content { get; set; } = string.Empty;
    public UserResponseDto Author { get; set; } = null!;
    public List<UserResponseDto> Mentions { get; set; } = new List<UserResponseDto>();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCommentDto
{
    public string Content { get; set; } = string.Empty;
    public List<Guid>? Mentions { get; set; }
}

public class UpdateCommentDto
{
    public string Content { get; set; } = string.Empty;
}

public class AttachmentResponseDto
{
    public Guid Id { get; set; }
    public Guid CardId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long Size { get; set; }
    public UserResponseDto UploadedBy { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

public class ExcelImportResponseDto
{
    public string ImportId { get; set; } = string.Empty;
    public Guid BoardId { get; set; }
    public ExcelImportSummaryDto Summary { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

public class ExcelImportSummaryDto
{
    public int ListsCreated { get; set; }
    public int CardsCreated { get; set; }
    public int ChecklistItemsCreated { get; set; }
    public int LabelsCreated { get; set; }
    public List<ExcelImportErrorDto> Errors { get; set; } = new List<ExcelImportErrorDto>();
}

public class ExcelImportErrorDto
{
    public int Row { get; set; }
    public string Column { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class ExcelImportOptionsDto
{
    public bool CreateMissingLists { get; set; } = true;
    public bool CreateMissingLabels { get; set; } = true;
    public bool SkipDuplicates { get; set; } = false;
}

public class ExcelImportStatusDto
{
    public string ImportId { get; set; } = string.Empty;
    public Guid BoardId { get; set; }
    public string Status { get; set; } = string.Empty;
    public ExcelImportSummaryDto Summary { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class NotificationResponseDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public Guid? CardId { get; set; }
    public Guid? BoardId { get; set; }
    public bool IsRead { get; set; }
    public List<string> Channels { get; set; } = new List<string>();
    public DateTime CreatedAt { get; set; }
}

public class NotificationListResponseDto
{
    public IEnumerable<NotificationResponseDto> Notifications { get; set; } = new List<NotificationResponseDto>();
    public int Total { get; set; }
    public int UnreadCount { get; set; }
    public int Limit { get; set; }
    public int Offset { get; set; }
}

public class ActivityLogResponseDto
{
    public Guid Id { get; set; }
    public Guid BoardId { get; set; }
    public Guid? CardId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public UserResponseDto User { get; set; } = null!;
    public object Metadata { get; set; } = new { };
    public DateTime CreatedAt { get; set; }
}

public class AutomationRuleResponseDto
{
    public Guid Id { get; set; }
    public Guid BoardId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool Enabled { get; set; }
    public object Trigger { get; set; } = new { };
    public List<object> Actions { get; set; } = new List<object>();
    public int ExecutionCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateAutomationRuleDto
{
    public string Name { get; set; } = string.Empty;
    public bool Enabled { get; set; } = true;
    public object Trigger { get; set; } = new { };
    public List<object> Actions { get; set; } = new List<object>();
}

public class UpdateAutomationRuleDto
{
    public string? Name { get; set; }
    public bool? Enabled { get; set; }
    public object? Trigger { get; set; }
    public List<object>? Actions { get; set; }
}

