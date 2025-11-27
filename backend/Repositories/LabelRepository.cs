using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Repositories;

public class LabelRepository : BaseRepository<Label>, ILabelRepository
{
    private new readonly ApplicationDbContext _context;

    public LabelRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Label>> GetBoardLabelsAsync(Guid boardId)
    {
        return await _dbSet
            .Where(l => l.BoardId == boardId)
            .OrderBy(l => l.Name)
            .ToListAsync();
    }

    public async Task<Label?> GetByNameAsync(Guid boardId, string name)
    {
        return await _dbSet
            .FirstOrDefaultAsync(l => l.BoardId == boardId && l.Name == name);
    }

    public async Task AddLabelToCardAsync(Guid cardId, Guid labelId)
    {
        var cardLabel = new CardLabel
        {
            CardId = cardId,
            LabelId = labelId
        };
        await _context.CardLabels.AddAsync(cardLabel);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveLabelFromCardAsync(Guid cardId, Guid labelId)
    {
        var cardLabel = await _context.CardLabels
            .FirstOrDefaultAsync(cl => cl.CardId == cardId && cl.LabelId == labelId);
        
        if (cardLabel != null)
        {
            _context.CardLabels.Remove(cardLabel);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Label>> GetCardLabelsAsync(Guid cardId)
    {
        return await _context.CardLabels
            .Where(cl => cl.CardId == cardId)
            .Include(cl => cl.Label)
            .Select(cl => cl.Label)
            .ToListAsync();
    }
}

