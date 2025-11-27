using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.DTOs;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Services;

public class BoardService : IBoardService
{
    private readonly IBoardRepository _boardRepository;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BoardService> _logger;

    public BoardService(IBoardRepository boardRepository, ApplicationDbContext context, ILogger<BoardService> logger)
    {
        _boardRepository = boardRepository;
        _context = context;
        _logger = logger;
    }

    public async Task<BoardResponseDto> CreateBoardAsync(Guid userId, CreateBoardDto dto)
    {
        var board = new Board
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            OwnerId = userId,
            BackgroundType = dto.Background?.Type ?? "color",
            BackgroundValue = dto.Background?.Value ?? "#0079bf",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _boardRepository.AddAsync(board);

        // Add owner as board member
        var boardMember = new BoardMember
        {
            Id = Guid.NewGuid(),
            BoardId = board.Id,
            UserId = userId,
            Role = "owner",
            JoinedAt = DateTime.UtcNow
        };

        await _boardRepository.AddBoardMemberAsync(boardMember);

        return await GetBoardByIdAsync(board.Id, userId);
    }

    public async Task<BoardResponseDto> GetBoardByIdAsync(Guid boardId, Guid userId)
    {
        var board = await _boardRepository.GetByIdAsync(boardId);
        if (board == null)
            throw new KeyNotFoundException("Board not found");

        // Check if user is member
        var member = await _boardRepository.GetBoardMemberAsync(boardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        var memberCount = await _context.BoardMembers.CountAsync(bm => bm.BoardId == boardId);
        var listCount = await _context.Lists.CountAsync(l => l.BoardId == boardId);

        return new BoardResponseDto
        {
            Id = board.Id,
            Name = board.Name,
            Description = board.Description,
            Background = new BackgroundDto
            {
                Type = board.BackgroundType,
                Value = board.BackgroundValue
            },
            OwnerId = board.OwnerId,
            UserRole = member.Role,
            MemberCount = memberCount,
            ListCount = listCount,
            CreatedAt = board.CreatedAt,
            UpdatedAt = board.UpdatedAt
        };
    }

    public async Task<BoardResponseDto> UpdateBoardAsync(Guid boardId, Guid userId, UpdateBoardDto dto)
    {
        var board = await _boardRepository.GetByIdAsync(boardId);
        if (board == null)
            throw new KeyNotFoundException("Board not found");

        // Check permissions (owner or leader)
        var member = await _boardRepository.GetBoardMemberAsync(boardId, userId);
        if (member == null || (member.Role != "owner" && member.Role != "leader"))
            throw new UnauthorizedAccessException("Only owner or leader can update board");

        if (!string.IsNullOrEmpty(dto.Name))
            board.Name = dto.Name;

        if (dto.Description != null)
            board.Description = dto.Description;

        if (dto.Background != null)
        {
            board.BackgroundType = dto.Background.Type;
            board.BackgroundValue = dto.Background.Value;
        }

        board.UpdatedAt = DateTime.UtcNow;
        await _boardRepository.UpdateAsync(board);

        return await GetBoardByIdAsync(boardId, userId);
    }

    public async Task DeleteBoardAsync(Guid boardId, Guid userId)
    {
        var board = await _boardRepository.GetByIdAsync(boardId);
        if (board == null)
            throw new KeyNotFoundException("Board not found");

        // Only owner can delete
        if (board.OwnerId != userId)
            throw new UnauthorizedAccessException("Only owner can delete board");

        await _boardRepository.DeleteAsync(board);
    }

    public async Task<IEnumerable<BoardResponseDto>> GetUserBoardsAsync(Guid userId, int limit = 50, int offset = 0, string? sortBy = null, string? order = null)
    {
        var boards = await _boardRepository.GetUserBoardsAsync(userId);

        // Apply sorting
        if (!string.IsNullOrEmpty(sortBy))
        {
            boards = sortBy.ToLower() switch
            {
                "name" => order == "asc" ? boards.OrderBy(b => b.Name) : boards.OrderByDescending(b => b.Name),
                "createdat" => order == "asc" ? boards.OrderBy(b => b.CreatedAt) : boards.OrderByDescending(b => b.CreatedAt),
                _ => boards.OrderByDescending(b => b.UpdatedAt)
            };
        }
        else
        {
            boards = boards.OrderByDescending(b => b.UpdatedAt);
        }

        var boardList = boards.Skip(offset).Take(limit).ToList();

        var result = new List<BoardResponseDto>();
        foreach (var board in boardList)
        {
            var member = await _boardRepository.GetBoardMemberAsync(board.Id, userId);
            var memberCount = await _context.BoardMembers.CountAsync(bm => bm.BoardId == board.Id);
            var listCount = await _context.Lists.CountAsync(l => l.BoardId == board.Id);

            result.Add(new BoardResponseDto
            {
                Id = board.Id,
                Name = board.Name,
                Description = board.Description,
                Background = new BackgroundDto
                {
                    Type = board.BackgroundType,
                    Value = board.BackgroundValue
                },
                OwnerId = board.OwnerId,
                UserRole = member?.Role,
                MemberCount = memberCount,
                ListCount = listCount,
                CreatedAt = board.CreatedAt,
                UpdatedAt = board.UpdatedAt
            });
        }

        return result;
    }
}
