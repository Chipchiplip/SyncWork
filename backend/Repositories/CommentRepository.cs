using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Repositories;

public class CommentRepository : BaseRepository<Comment>, ICommentRepository
{
    public CommentRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Comment>> GetCardCommentsAsync(Guid cardId, int limit = 50, int offset = 0)
    {
        return await _dbSet
            .Where(c => c.CardId == cardId)
            .OrderBy(c => c.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();
    }
}

