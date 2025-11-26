using TaskManager.DTOs;

namespace TaskManager.Interfaces;

public interface IListService
{
    Task<ListResponseDto> CreateListAsync(Guid boardId, Guid userId, CreateListDto dto);
    Task<ListResponseDto> GetListByIdAsync(Guid listId, Guid userId);
    Task<ListResponseDto> UpdateListAsync(Guid listId, Guid userId, UpdateListDto dto);
    Task DeleteListAsync(Guid listId, Guid userId);
    Task<IEnumerable<ListResponseDto>> GetBoardListsAsync(Guid boardId, Guid userId, bool includeCards = false);
    Task ReorderListsAsync(Guid boardId, Guid userId, ReorderListsDto dto);
}

