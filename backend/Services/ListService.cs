using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.DTOs;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Services;

public class ListService : IListService
{
    private readonly IListRepository _listRepository;
    private readonly IBoardRepository _boardRepository;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ListService> _logger;

    public ListService(
        IListRepository listRepository,
        IBoardRepository boardRepository,
        ApplicationDbContext context,
        ILogger<ListService> logger)
    {
        _listRepository = listRepository;
        _boardRepository = boardRepository;
        _context = context;
        _logger = logger;
    }

    public async Task<ListResponseDto> CreateListAsync(Guid boardId, Guid userId, CreateListDto dto)
    {
        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(boardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        var list = new List
        {
            Id = Guid.NewGuid(),
            BoardId = boardId,
            Name = dto.Name,
            Position = dto.Position,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _listRepository.AddAsync(list);

        var cardCount = await _context.Cards.CountAsync(c => c.ListId == list.Id);

        return new ListResponseDto
        {
            Id = list.Id,
            BoardId = list.BoardId,
            Name = list.Name,
            Position = list.Position,
            CardCount = cardCount,
            CreatedAt = list.CreatedAt,
            UpdatedAt = list.UpdatedAt
        };
    }

    public async Task<ListResponseDto> GetListByIdAsync(Guid listId, Guid userId)
    {
        var list = await _listRepository.GetByIdAsync(listId);
        if (list == null)
            throw new KeyNotFoundException("List not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(list.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        var cardCount = await _context.Cards.CountAsync(c => c.ListId == listId);

        return new ListResponseDto
        {
            Id = list.Id,
            BoardId = list.BoardId,
            Name = list.Name,
            Position = list.Position,
            CardCount = cardCount,
            CreatedAt = list.CreatedAt,
            UpdatedAt = list.UpdatedAt
        };
    }

    public async Task<ListResponseDto> UpdateListAsync(Guid listId, Guid userId, UpdateListDto dto)
    {
        var list = await _listRepository.GetByIdAsync(listId);
        if (list == null)
            throw new KeyNotFoundException("List not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(list.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        if (!string.IsNullOrEmpty(dto.Name))
            list.Name = dto.Name;

        if (dto.Position.HasValue)
            list.Position = dto.Position.Value;

        list.UpdatedAt = DateTime.UtcNow;
        await _listRepository.UpdateAsync(list);

        var cardCount = await _context.Cards.CountAsync(c => c.ListId == listId);

        return new ListResponseDto
        {
            Id = list.Id,
            BoardId = list.BoardId,
            Name = list.Name,
            Position = list.Position,
            CardCount = cardCount,
            CreatedAt = list.CreatedAt,
            UpdatedAt = list.UpdatedAt
        };
    }

    public async Task DeleteListAsync(Guid listId, Guid userId)
    {
        var list = await _listRepository.GetByIdAsync(listId);
        if (list == null)
            throw new KeyNotFoundException("List not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(list.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        await _listRepository.DeleteAsync(list);
    }

    public async Task<IEnumerable<ListResponseDto>> GetBoardListsAsync(Guid boardId, Guid userId, bool includeCards = false)
    {
        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(boardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        var lists = await _listRepository.GetBoardListsAsync(boardId);

        var result = new List<ListResponseDto>();
        foreach (var list in lists)
        {
            var cardCount = await _context.Cards.CountAsync(c => c.ListId == list.Id);

            result.Add(new ListResponseDto
            {
                Id = list.Id,
                BoardId = list.BoardId,
                Name = list.Name,
                Position = list.Position,
                CardCount = cardCount,
                CreatedAt = list.CreatedAt,
                UpdatedAt = list.UpdatedAt
            });
        }

        return result;
    }

    public async Task ReorderListsAsync(Guid boardId, Guid userId, ReorderListsDto dto)
    {
        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(boardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        // Validate all lists belong to this board
        var boardLists = await _listRepository.GetBoardListsAsync(boardId);
        var boardListIds = boardLists.Select(l => l.Id).ToHashSet();

        if (dto.ListIds.Any(id => !boardListIds.Contains(id)))
            throw new ArgumentException("Some lists do not belong to this board");

        await _listRepository.ReorderListsAsync(boardId, dto.ListIds);
    }
}
