using TaskManager.DTOs;

namespace TaskManager.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationResponseDto>> GetUserNotificationsAsync(Guid userId, bool unreadOnly = false, string? type = null, int limit = 20, int offset = 0);
    Task<NotificationResponseDto> MarkAsReadAsync(Guid notificationId, Guid userId);
    Task MarkAllAsReadAsync(Guid userId);
    Task DeleteNotificationAsync(Guid notificationId, Guid userId);
    Task SendNotificationAsync(Guid userId, string type, string title, string message, Guid? cardId = null, Guid? boardId = null, List<string>? channels = null);
}

