using TaskManager.DTOs;

namespace TaskManager.Interfaces;

public interface ICardService
{
    Task<CardResponseDto> CreateCardAsync(Guid listId, Guid userId, CreateCardDto dto);
    Task<CardResponseDto> GetCardByIdAsync(Guid cardId, Guid userId, bool includeChecklist = true, bool includeComments = true, bool includeAttachments = true);
    Task<CardResponseDto> UpdateCardAsync(Guid cardId, Guid userId, UpdateCardDto dto);
    Task DeleteCardAsync(Guid cardId, Guid userId);
    Task<CardResponseDto> MoveCardAsync(Guid cardId, Guid userId, MoveCardDto dto);
    Task<CardResponseDto> UpdateCardStatusAsync(Guid cardId, Guid userId, string status);
    Task<CardResponseDto> ApproveCardAsync(Guid cardId, Guid userId, string? comment);
    Task<CardResponseDto> RejectCardAsync(Guid cardId, Guid userId, string reason);
    Task<IEnumerable<CardResponseDto>> GetListCardsAsync(Guid listId, Guid userId, string? status = null, Guid? assigneeId = null, Guid? labelId = null, string? dueDate = null);
    Task<IEnumerable<CardResponseDto>> SearchCardsAsync(Guid boardId, Guid userId, string query, string? status = null, Guid? assigneeId = null, Guid? labelId = null, string? dueDate = null, int limit = 20, int offset = 0);
}

