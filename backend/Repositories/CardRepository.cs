using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Repositories;

public class CardRepository : BaseRepository<Card>, ICardRepository
{
    public CardRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Card>> GetListCardsAsync(Guid listId)
    {
        return await _dbSet
            .Where(c => c.ListId == listId)
            .OrderBy(c => c.Position)
            .ToListAsync();
    }

    public async Task<IEnumerable<Card>> SearchCardsAsync(Guid boardId, string query, string? status = null, Guid? assigneeId = null, Guid? labelId = null, string? dueDate = null)
    {
        var cards = _dbSet.Where(c => c.BoardId == boardId);

        if (!string.IsNullOrEmpty(query))
        {
            cards = cards.Where(c => c.Title.Contains(query) || (c.Description != null && c.Description.Contains(query)));
        }

        if (!string.IsNullOrEmpty(status))
        {
            cards = cards.Where(c => c.Status == status);
        }

        if (assigneeId.HasValue)
        {
            cards = cards.Where(c => c.AssigneeId == assigneeId);
        }

        if (labelId.HasValue)
        {
            cards = cards.Where(c => c.CardLabels.Any(cl => cl.LabelId == labelId));
        }

        if (!string.IsNullOrEmpty(dueDate))
        {
            cards = cards.Where(c => c.DueDate == dueDate);
        }

        return await cards.ToListAsync();
    }

    public async Task MoveCardAsync(Card card, Guid newListId, int newPosition)
    {
        card.ListId = newListId;
        card.Position = newPosition;
        await UpdateAsync(card);
    }

    public async Task UpdateCardStatusAsync(Card card, string status)
    {
        card.Status = status;
        await UpdateAsync(card);
    }
}

