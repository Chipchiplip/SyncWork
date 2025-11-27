using TaskManager.DTOs;
using TaskManager.Models;

namespace TaskManager.Interfaces;

public interface IAutomationRuleService
{
    Task<AutomationRuleResponseDto> CreateRuleAsync(Guid boardId, Guid userId, CreateAutomationRuleDto dto);
    Task<AutomationRuleResponseDto> GetRuleByIdAsync(Guid automationId, Guid userId);
    Task<AutomationRuleResponseDto> UpdateRuleAsync(Guid automationId, Guid userId, UpdateAutomationRuleDto dto);
    Task DeleteRuleAsync(Guid automationId, Guid userId);
    Task<IEnumerable<AutomationRuleResponseDto>> GetBoardRulesAsync(Guid boardId, Guid userId, bool enabledOnly = false);
    Task ExecuteRuleAsync(AutomationRule rule, object triggerData);
}

