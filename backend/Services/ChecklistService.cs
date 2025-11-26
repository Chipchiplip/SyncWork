using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Services;

public class ChecklistService : IChecklistService
{
    private readonly IChecklistRepository _checklistRepository;
    private readonly ILogger<ChecklistService> _logger;

    public ChecklistService(IChecklistRepository checklistRepository, ILogger<ChecklistService> logger)
    {
        _checklistRepository = checklistRepository;
        _logger = logger;
    }

    public Task<ChecklistItemResponseDto> CreateChecklistItemAsync(Guid cardId, Guid userId, CreateChecklistItemDto dto)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<ChecklistItemResponseDto> UpdateChecklistItemAsync(Guid checklistId, Guid userId, UpdateChecklistItemDto dto)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<ChecklistItemResponseDto> ToggleChecklistItemAsync(Guid checklistId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task DeleteChecklistItemAsync(Guid checklistId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<ChecklistProgressResponseDto> GetCardChecklistItemsAsync(Guid cardId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }
}

