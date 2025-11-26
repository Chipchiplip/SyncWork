using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Services;

public class LabelService : ILabelService
{
    private readonly ILabelRepository _labelRepository;
    private readonly ILogger<LabelService> _logger;

    public LabelService(ILabelRepository labelRepository, ILogger<LabelService> logger)
    {
        _labelRepository = labelRepository;
        _logger = logger;
    }

    public Task<LabelResponseDto> CreateLabelAsync(Guid boardId, Guid userId, CreateLabelDto dto)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<LabelResponseDto> UpdateLabelAsync(Guid labelId, Guid userId, UpdateLabelDto dto)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task DeleteLabelAsync(Guid labelId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<IEnumerable<LabelResponseDto>> GetBoardLabelsAsync(Guid boardId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task AddLabelToCardAsync(Guid cardId, Guid labelId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task RemoveLabelFromCardAsync(Guid cardId, Guid labelId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }
}

