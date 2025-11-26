using TaskManager.DTOs;

namespace TaskManager.Interfaces;

public interface IChecklistService
{
    Task<ChecklistItemResponseDto> CreateChecklistItemAsync(Guid cardId, Guid userId, CreateChecklistItemDto dto);
    Task<ChecklistItemResponseDto> UpdateChecklistItemAsync(Guid checklistId, Guid userId, UpdateChecklistItemDto dto);
    Task<ChecklistItemResponseDto> ToggleChecklistItemAsync(Guid checklistId, Guid userId);
    Task DeleteChecklistItemAsync(Guid checklistId, Guid userId);
    Task<ChecklistProgressResponseDto> GetCardChecklistItemsAsync(Guid cardId, Guid userId);
}

