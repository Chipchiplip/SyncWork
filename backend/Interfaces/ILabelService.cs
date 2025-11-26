using TaskManager.DTOs;

namespace TaskManager.Interfaces;

public interface ILabelService
{
    Task<LabelResponseDto> CreateLabelAsync(Guid boardId, Guid userId, CreateLabelDto dto);
    Task<LabelResponseDto> UpdateLabelAsync(Guid labelId, Guid userId, UpdateLabelDto dto);
    Task DeleteLabelAsync(Guid labelId, Guid userId);
    Task<IEnumerable<LabelResponseDto>> GetBoardLabelsAsync(Guid boardId, Guid userId);
    Task AddLabelToCardAsync(Guid cardId, Guid labelId, Guid userId);
    Task RemoveLabelFromCardAsync(Guid cardId, Guid labelId, Guid userId);
}

