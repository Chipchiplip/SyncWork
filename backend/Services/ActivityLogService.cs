using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.DTOs;
using TaskManager.Interfaces;
using TaskManager.Models;
using System.Text.Json;

namespace TaskManager.Services;

public class ActivityLogService : IActivityLogService
{
    private readonly IActivityLogRepository _activityLogRepository;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ActivityLogService> _logger;

    public ActivityLogService(
        IActivityLogRepository activityLogRepository,
        ApplicationDbContext context,
        ILogger<ActivityLogService> logger)
    {
        _activityLogRepository = activityLogRepository;
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<ActivityLogResponseDto>> GetBoardActivityLogsAsync(Guid boardId, Guid userId, string? type = null, Guid? userIdFilter = null, Guid? cardId = null, int limit = 50, int offset = 0)
    {
        var activities = await _activityLogRepository.GetBoardActivityLogsAsync(boardId, type, userIdFilter, cardId, limit, offset);

        var result = new List<ActivityLogResponseDto>();
        foreach (var activity in activities)
        {
            var user = await _context.Users.FindAsync(activity.UserId);
            var metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(activity.Metadata) ?? new Dictionary<string, object>();

            result.Add(new ActivityLogResponseDto
            {
                Id = activity.Id,
                BoardId = activity.BoardId,
                CardId = activity.CardId,
                Type = activity.Type,
                Description = activity.Description,
                User = new UserResponseDto
                {
                    Id = user!.Id,
                    GoogleId = user.GoogleId,
                    Name = user.Name,
                    Email = user.Email,
                    AvatarUrl = user.AvatarUrl,
                    TelegramChatId = user.TelegramChatId,
                    CreatedAt = user.CreatedAt,
                    LastLoginAt = user.LastLoginAt,
                    Role = user.Role
                },
                Metadata = metadata,
                CreatedAt = activity.CreatedAt
            });
        }

        return result;
    }

    public async Task<IEnumerable<ActivityLogResponseDto>> GetCardActivityLogsAsync(Guid cardId, Guid userId, int limit = 50, int offset = 0)
    {
        var activities = await _activityLogRepository.GetCardActivityLogsAsync(cardId, limit, offset);

        var result = new List<ActivityLogResponseDto>();
        foreach (var activity in activities)
        {
            var user = await _context.Users.FindAsync(activity.UserId);
            var metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(activity.Metadata) ?? new Dictionary<string, object>();

            result.Add(new ActivityLogResponseDto
            {
                Id = activity.Id,
                BoardId = activity.BoardId,
                CardId = activity.CardId,
                Type = activity.Type,
                Description = activity.Description,
                User = new UserResponseDto
                {
                    Id = user!.Id,
                    GoogleId = user.GoogleId,
                    Name = user.Name,
                    Email = user.Email,
                    AvatarUrl = user.AvatarUrl,
                    TelegramChatId = user.TelegramChatId,
                    CreatedAt = user.CreatedAt,
                    LastLoginAt = user.LastLoginAt,
                    Role = user.Role
                },
                Metadata = metadata,
                CreatedAt = activity.CreatedAt
            });
        }

        return result;
    }

    public async Task LogActivityAsync(Guid boardId, Guid? cardId, Guid userId, string type, string description, object? metadata = null)
    {
        var activity = new ActivityLog
        {
            Id = Guid.NewGuid(),
            BoardId = boardId,
            CardId = cardId,
            Type = type,
            Description = description,
            UserId = userId,
            Metadata = metadata != null ? JsonSerializer.Serialize(metadata) : "{}",
            CreatedAt = DateTime.UtcNow
        };

        await _activityLogRepository.LogActivityAsync(activity);
    }
}
