using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Repositories;

public class AutomationRuleRepository : BaseRepository<AutomationRule>, IAutomationRuleRepository
{
    public AutomationRuleRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<AutomationRule>> GetBoardAutomationRulesAsync(Guid boardId, bool enabledOnly = false)
    {
        var rules = _dbSet.Where(r => r.BoardId == boardId);

        if (enabledOnly)
            rules = rules.Where(r => r.Enabled);

        return await rules
            .OrderBy(r => r.Name)
            .ToListAsync();
    }
}

