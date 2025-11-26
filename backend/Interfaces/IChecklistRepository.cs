using TaskManager.Models;

namespace TaskManager.Interfaces;

public interface IChecklistRepository : IRepository<ChecklistItem>
{
    Task<IEnumerable<ChecklistItem>> GetCardChecklistItemsAsync(Guid cardId);
    Task<(int total, int completed, double percentage)> GetChecklistProgressAsync(Guid cardId);
}

