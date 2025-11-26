using TaskManager.Models;

namespace TaskManager.Interfaces;

public interface ICommentRepository : IRepository<Comment>
{
    Task<IEnumerable<Comment>> GetCardCommentsAsync(Guid cardId, int limit = 50, int offset = 0);
}

