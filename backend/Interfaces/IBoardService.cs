using TaskManager.DTOs;

namespace TaskManager.Interfaces;

public interface IBoardService
{
    Task<BoardResponseDto> CreateBoardAsync(Guid userId, CreateBoardDto dto);
    Task<BoardResponseDto> GetBoardByIdAsync(Guid boardId, Guid userId);
    Task<BoardResponseDto> UpdateBoardAsync(Guid boardId, Guid userId, UpdateBoardDto dto);
    Task DeleteBoardAsync(Guid boardId, Guid userId);
    Task<IEnumerable<BoardResponseDto>> GetUserBoardsAsync(Guid userId, int limit = 50, int offset = 0, string? sortBy = null, string? order = null);
}

