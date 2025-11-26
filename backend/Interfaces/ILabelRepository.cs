using TaskManager.Models;

namespace TaskManager.Interfaces;

public interface ILabelRepository : IRepository<Label>
{
    Task<IEnumerable<Label>> GetBoardLabelsAsync(Guid boardId);
    Task<Label?> GetByNameAsync(Guid boardId, string name);
    Task AddLabelToCardAsync(Guid cardId, Guid labelId);
    Task RemoveLabelFromCardAsync(Guid cardId, Guid labelId);
    Task<IEnumerable<Label>> GetCardLabelsAsync(Guid cardId);
}

