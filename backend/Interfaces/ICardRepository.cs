using TaskManager.Models;

namespace TaskManager.Interfaces;

public interface ICardRepository : IRepository<Card>
{
    Task<IEnumerable<Card>> GetListCardsAsync(Guid listId);
    Task<IEnumerable<Card>> SearchCardsAsync(Guid boardId, string query, string? status = null, Guid? assigneeId = null, Guid? labelId = null, string? dueDate = null);
    Task MoveCardAsync(Card card, Guid newListId, int newPosition);
    Task UpdateCardStatusAsync(Card card, string status);
}

