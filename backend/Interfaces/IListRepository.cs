using TaskManager.Models;

namespace TaskManager.Interfaces;

public interface IListRepository : IRepository<List>
{
    Task<IEnumerable<List>> GetBoardListsAsync(Guid boardId);
    Task ReorderListsAsync(Guid boardId, List<Guid> listIds);
}

