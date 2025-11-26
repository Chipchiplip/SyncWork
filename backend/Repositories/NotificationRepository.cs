using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Repositories;

public class NotificationRepository : BaseRepository<Notification>, INotificationRepository
{
    public NotificationRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Notification>> GetUserNotificationsAsync(Guid userId, bool unreadOnly = false, string? type = null, int limit = 20, int offset = 0)
    {
        var notifications = _dbSet.Where(n => n.UserId == userId);

        if (unreadOnly)
            notifications = notifications.Where(n => !n.IsRead);

        if (!string.IsNullOrEmpty(type))
            notifications = notifications.Where(n => n.Type == type);

        return await notifications
            .OrderByDescending(n => n.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _dbSet.CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task MarkAsReadAsync(Notification notification)
    {
        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        await UpdateAsync(notification);
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        var notifications = await _dbSet
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }
}

