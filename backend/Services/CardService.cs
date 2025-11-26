using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Services;

public class CardService : ICardService
{
    private readonly ICardRepository _cardRepository;
    private readonly ILogger<CardService> _logger;

    public CardService(ICardRepository cardRepository, ILogger<CardService> logger)
    {
        _cardRepository = cardRepository;
        _logger = logger;
    }

    public Task<CardResponseDto> CreateCardAsync(Guid listId, Guid userId, CreateCardDto dto)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<CardResponseDto> GetCardByIdAsync(Guid cardId, Guid userId, bool includeChecklist = true, bool includeComments = true, bool includeAttachments = true)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<CardResponseDto> UpdateCardAsync(Guid cardId, Guid userId, UpdateCardDto dto)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task DeleteCardAsync(Guid cardId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<CardResponseDto> MoveCardAsync(Guid cardId, Guid userId, MoveCardDto dto)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<CardResponseDto> UpdateCardStatusAsync(Guid cardId, Guid userId, string status)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<CardResponseDto> ApproveCardAsync(Guid cardId, Guid userId, string? comment)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<CardResponseDto> RejectCardAsync(Guid cardId, Guid userId, string reason)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<IEnumerable<CardResponseDto>> GetListCardsAsync(Guid listId, Guid userId, string? status = null, Guid? assigneeId = null, Guid? labelId = null, string? dueDate = null)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<IEnumerable<CardResponseDto>> SearchCardsAsync(Guid boardId, Guid userId, string query, string? status = null, Guid? assigneeId = null, Guid? labelId = null, string? dueDate = null, int limit = 20, int offset = 0)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }
}

