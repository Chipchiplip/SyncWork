using TaskManager.Models;

namespace TaskManager.Interfaces;

public interface IActivityLogRepository : IRepository<ActivityLog>
{
    Task<IEnumerable<ActivityLog>> GetBoardActivityLogsAsync(Guid boardId, string? type = null, Guid? userId = null, Guid? cardId = null, int limit = 50, int offset = 0);
    Task<IEnumerable<ActivityLog>> GetCardActivityLogsAsync(Guid cardId, int limit = 50, int offset = 0);
    Task LogActivityAsync(ActivityLog activity);
}

