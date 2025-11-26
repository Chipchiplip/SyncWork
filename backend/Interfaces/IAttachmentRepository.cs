using TaskManager.Models;

namespace TaskManager.Interfaces;

public interface IAttachmentRepository : IRepository<Attachment>
{
    Task<IEnumerable<Attachment>> GetCardAttachmentsAsync(Guid cardId);
}

