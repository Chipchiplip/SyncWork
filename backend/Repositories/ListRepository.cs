using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Repositories;

public class ListRepository : BaseRepository<List>, IListRepository
{
    public ListRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<List>> GetBoardListsAsync(Guid boardId)
    {
        return await _dbSet
            .Where(l => l.BoardId == boardId)
            .OrderBy(l => l.Position)
            .ToListAsync();
    }

    public async Task ReorderListsAsync(Guid boardId, List<Guid> listIds)
    {
        var lists = await _dbSet
            .Where(l => l.BoardId == boardId && listIds.Contains(l.Id))
            .ToListAsync();

        for (int i = 0; i < listIds.Count; i++)
        {
            var list = lists.FirstOrDefault(l => l.Id == listIds[i]);
            if (list != null)
            {
                list.Position = i;
            }
        }

        await _context.SaveChangesAsync();
    }
}

