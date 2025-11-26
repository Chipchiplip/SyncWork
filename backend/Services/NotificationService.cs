using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(INotificationRepository notificationRepository, ILogger<NotificationService> logger)
    {
        _notificationRepository = notificationRepository;
        _logger = logger;
    }

    public Task<IEnumerable<NotificationResponseDto>> GetUserNotificationsAsync(Guid userId, bool unreadOnly = false, string? type = null, int limit = 20, int offset = 0)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<NotificationResponseDto> MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task MarkAllAsReadAsync(Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task DeleteNotificationAsync(Guid notificationId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task SendNotificationAsync(Guid userId, string type, string title, string message, Guid? cardId = null, Guid? boardId = null, List<string>? channels = null)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }
}

