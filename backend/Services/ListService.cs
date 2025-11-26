using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Services;

public class ListService : IListService
{
    private readonly IListRepository _listRepository;
    private readonly ILogger<ListService> _logger;

    public ListService(IListRepository listRepository, ILogger<ListService> logger)
    {
        _listRepository = listRepository;
        _logger = logger;
    }

    public Task<ListResponseDto> CreateListAsync(Guid boardId, Guid userId, CreateListDto dto)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<ListResponseDto> GetListByIdAsync(Guid listId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<ListResponseDto> UpdateListAsync(Guid listId, Guid userId, UpdateListDto dto)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task DeleteListAsync(Guid listId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<IEnumerable<ListResponseDto>> GetBoardListsAsync(Guid boardId, Guid userId, bool includeCards = false)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task ReorderListsAsync(Guid boardId, Guid userId, ReorderListsDto dto)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }
}

