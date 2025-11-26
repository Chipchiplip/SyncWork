using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Repositories;

public class AttachmentRepository : BaseRepository<Attachment>, IAttachmentRepository
{
    public AttachmentRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Attachment>> GetCardAttachmentsAsync(Guid cardId)
    {
        return await _dbSet
            .Where(a => a.CardId == cardId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }
}

