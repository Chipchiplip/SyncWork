using TaskManager.DTOs;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Services;

public class ChecklistService : IChecklistService
{
    private readonly IChecklistRepository _checklistRepository;
    private readonly ICardRepository _cardRepository;
    private readonly ILogger<ChecklistService> _logger;

    public ChecklistService(
        IChecklistRepository checklistRepository, 
        ICardRepository cardRepository,
        ILogger<ChecklistService> logger)
    {
        _checklistRepository = checklistRepository;
        _cardRepository = cardRepository;
        _logger = logger;
    }

    public async Task<ChecklistItemResponseDto> CreateChecklistItemAsync(Guid cardId, Guid userId, CreateChecklistItemDto dto)
    {
        // Verify card exists and user has access
        var card = await _cardRepository.GetByIdAsync(cardId);
        if (card == null) throw new KeyNotFoundException("Card not found");

        // Get current max position
        var existingItems = await _checklistRepository.GetCardChecklistItemsAsync(cardId);
        var maxPosition = existingItems.Any() ? existingItems.Max(i => i.Position) : -1;

        var item = new ChecklistItem
        {
            Id = Guid.NewGuid(),
            CardId = cardId,
            Title = dto.Text,
            IsCompleted = false,
            Position = dto.Position ?? maxPosition + 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _checklistRepository.AddAsync(item);

        return MapToDto(item);
    }

    public async Task<ChecklistItemResponseDto> UpdateChecklistItemAsync(Guid checklistId, Guid userId, UpdateChecklistItemDto dto)
    {
        var item = await _checklistRepository.GetByIdAsync(checklistId);
        if (item == null) throw new KeyNotFoundException("Checklist item not found");

        if (!string.IsNullOrEmpty(dto.Text))
        {
            item.Title = dto.Text;
        }

        item.UpdatedAt = DateTime.UtcNow;

        await _checklistRepository.UpdateAsync(item);

        return MapToDto(item);
    }

    public async Task<ChecklistItemResponseDto> ToggleChecklistItemAsync(Guid checklistId, Guid userId)
    {
        var item = await _checklistRepository.GetByIdAsync(checklistId);
        if (item == null) throw new KeyNotFoundException("Checklist item not found");

        item.IsCompleted = !item.IsCompleted;
        item.UpdatedAt = DateTime.UtcNow;

        await _checklistRepository.UpdateAsync(item);

        return MapToDto(item);
    }

    public async Task DeleteChecklistItemAsync(Guid checklistId, Guid userId)
    {
        var item = await _checklistRepository.GetByIdAsync(checklistId);
        if (item == null) throw new KeyNotFoundException("Checklist item not found");

        await _checklistRepository.DeleteAsync(item);
    }

    public async Task<ChecklistProgressResponseDto> GetCardChecklistItemsAsync(Guid cardId, Guid userId)
    {
        var items = await _checklistRepository.GetCardChecklistItemsAsync(cardId);
        var (total, completed, percentage) = await _checklistRepository.GetChecklistProgressAsync(cardId);

        return new ChecklistProgressResponseDto
        {
            Total = total,
            Completed = completed,
            Percentage = percentage,
            Items = items.Select(MapToDto).ToList()
        };
    }

    private ChecklistItemResponseDto MapToDto(ChecklistItem item)
    {
        return new ChecklistItemResponseDto
        {
            Id = item.Id,
            CardId = item.CardId,
            Text = item.Title,
            IsCompleted = item.IsCompleted,
            Position = item.Position,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        };
    }
}
