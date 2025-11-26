using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Repositories;

public class ActivityLogRepository : BaseRepository<ActivityLog>, IActivityLogRepository
{
    public ActivityLogRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<ActivityLog>> GetBoardActivityLogsAsync(Guid boardId, string? type = null, Guid? userId = null, Guid? cardId = null, int limit = 50, int offset = 0)
    {
        var logs = _dbSet.Where(a => a.BoardId == boardId);

        if (!string.IsNullOrEmpty(type))
            logs = logs.Where(a => a.Type == type);

        if (userId.HasValue)
            logs = logs.Where(a => a.UserId == userId);

        if (cardId.HasValue)
            logs = logs.Where(a => a.CardId == cardId);

        return await logs
            .OrderByDescending(a => a.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<IEnumerable<ActivityLog>> GetCardActivityLogsAsync(Guid cardId, int limit = 50, int offset = 0)
    {
        return await _dbSet
            .Where(a => a.CardId == cardId)
            .OrderByDescending(a => a.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();
    }

    public async Task LogActivityAsync(ActivityLog activity)
    {
        await AddAsync(activity);
    }
}

