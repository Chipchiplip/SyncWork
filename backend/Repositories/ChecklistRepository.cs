using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Repositories;

public class ChecklistRepository : BaseRepository<ChecklistItem>, IChecklistRepository
{
    public ChecklistRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<ChecklistItem>> GetCardChecklistItemsAsync(Guid cardId)
    {
        return await _dbSet
            .Where(c => c.CardId == cardId)
            .OrderBy(c => c.Position)
            .ToListAsync();
    }

    public async Task<(int total, int completed, double percentage)> GetChecklistProgressAsync(Guid cardId)
    {
        var items = await _dbSet.Where(c => c.CardId == cardId).ToListAsync();
        var total = items.Count;
        var completed = items.Count(c => c.IsCompleted);
        var percentage = total > 0 ? (double)completed / total * 100 : 0;

        return (total, completed, percentage);
    }
}

