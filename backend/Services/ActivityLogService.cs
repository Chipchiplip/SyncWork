using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Services;

public class ActivityLogService : IActivityLogService
{
    private readonly IActivityLogRepository _activityLogRepository;
    private readonly ILogger<ActivityLogService> _logger;

    public ActivityLogService(IActivityLogRepository activityLogRepository, ILogger<ActivityLogService> logger)
    {
        _activityLogRepository = activityLogRepository;
        _logger = logger;
    }

    public Task<IEnumerable<ActivityLogResponseDto>> GetBoardActivityLogsAsync(Guid boardId, Guid userId, string? type = null, Guid? userIdFilter = null, Guid? cardId = null, int limit = 50, int offset = 0)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<IEnumerable<ActivityLogResponseDto>> GetCardActivityLogsAsync(Guid cardId, Guid userId, int limit = 50, int offset = 0)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task LogActivityAsync(Guid boardId, Guid? cardId, Guid userId, string type, string description, object? metadata = null)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }
}

