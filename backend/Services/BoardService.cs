using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Services;

public class BoardService : IBoardService
{
    private readonly IBoardRepository _boardRepository;
    private readonly ILogger<BoardService> _logger;

    public BoardService(IBoardRepository boardRepository, ILogger<BoardService> logger)
    {
        _boardRepository = boardRepository;
        _logger = logger;
    }

    public Task<BoardResponseDto> CreateBoardAsync(Guid userId, CreateBoardDto dto)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<BoardResponseDto> GetBoardByIdAsync(Guid boardId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<BoardResponseDto> UpdateBoardAsync(Guid boardId, Guid userId, UpdateBoardDto dto)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task DeleteBoardAsync(Guid boardId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<IEnumerable<BoardResponseDto>> GetUserBoardsAsync(Guid userId, int limit = 50, int offset = 0, string? sortBy = null, string? order = null)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }
}

