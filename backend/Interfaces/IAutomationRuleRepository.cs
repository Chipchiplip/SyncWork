using TaskManager.Models;

namespace TaskManager.Interfaces;

public interface IAutomationRuleRepository : IRepository<AutomationRule>
{
    Task<IEnumerable<AutomationRule>> GetBoardAutomationRulesAsync(Guid boardId, bool enabledOnly = false);
}

