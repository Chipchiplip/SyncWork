using TaskManager.DTOs;

namespace TaskManager.Interfaces;

public interface IActivityLogService
{
    Task<IEnumerable<ActivityLogResponseDto>> GetBoardActivityLogsAsync(Guid boardId, Guid userId, string? type = null, Guid? userIdFilter = null, Guid? cardId = null, int limit = 50, int offset = 0);
    Task<IEnumerable<ActivityLogResponseDto>> GetCardActivityLogsAsync(Guid cardId, Guid userId, int limit = 50, int offset = 0);
    Task LogActivityAsync(Guid boardId, Guid? cardId, Guid userId, string type, string description, object? metadata = null);
}

