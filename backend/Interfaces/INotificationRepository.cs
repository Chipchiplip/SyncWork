using TaskManager.Models;

namespace TaskManager.Interfaces;

public interface INotificationRepository : IRepository<Notification>
{
    Task<IEnumerable<Notification>> GetUserNotificationsAsync(Guid userId, bool unreadOnly = false, string? type = null, int limit = 20, int offset = 0);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task MarkAsReadAsync(Notification notification);
    Task MarkAllAsReadAsync(Guid userId);
}

