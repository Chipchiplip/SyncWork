using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.DTOs;
using TaskManager.Interfaces;
using TaskManager.Models;
using System.Text.Json;

namespace TaskManager.Services;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepository;
    private readonly ICardRepository _cardRepository;
    private readonly IBoardRepository _boardRepository;
    private readonly ApplicationDbContext _context;
    private readonly IActivityLogService _activityLogService;
    private readonly ILogger<CommentService> _logger;

    public CommentService(
        ICommentRepository commentRepository,
        ICardRepository cardRepository,
        IBoardRepository boardRepository,
        ApplicationDbContext context,
        IActivityLogService activityLogService,
        ILogger<CommentService> logger)
    {
        _commentRepository = commentRepository;
        _cardRepository = cardRepository;
        _boardRepository = boardRepository;
        _context = context;
        _activityLogService = activityLogService;
        _logger = logger;
    }

    public async Task<CommentResponseDto> CreateCommentAsync(Guid cardId, Guid userId, CreateCommentDto dto)
    {
        var card = await _cardRepository.GetByIdAsync(cardId);
        if (card == null)
            throw new KeyNotFoundException("Card not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(card.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        var mentionsJson = dto.Mentions != null && dto.Mentions.Any()
            ? JsonSerializer.Serialize(dto.Mentions)
            : "[]";

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            CardId = cardId,
            AuthorId = userId,
            Content = dto.Content,
            Mentions = mentionsJson,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _commentRepository.AddAsync(comment);

        // Get author
        var author = await _context.Users.FindAsync(userId);

        // Get mentioned users
        var mentionedUsers = new List<User>();
        if (dto.Mentions != null && dto.Mentions.Any())
        {
            foreach (var mentionId in dto.Mentions)
            {
                var user = await _context.Users.FindAsync(mentionId);
                if (user != null)
                    mentionedUsers.Add(user);
            }
        }

        // Log activity
        await _activityLogService.LogActivityAsync(
            card.BoardId,
            card.Id,
            userId,
            "comment",
            $"Commented on card '{card.Title}'",
            new { commentContent = dto.Content }
        );

        return new CommentResponseDto
        {
            Id = comment.Id,
            CardId = comment.CardId,
            Content = comment.Content,
            Author = new UserResponseDto
            {
                Id = author!.Id,
                GoogleId = author.GoogleId,
                Name = author.Name,
                Email = author.Email,
                AvatarUrl = author.AvatarUrl,
                TelegramChatId = author.TelegramChatId,
                CreatedAt = author.CreatedAt,
                LastLoginAt = author.LastLoginAt,
                Role = author.Role
            },
            Mentions = mentionedUsers.Select(u => new UserResponseDto
            {
                Id = u.Id,
                GoogleId = u.GoogleId,
                Name = u.Name,
                Email = u.Email,
                AvatarUrl = u.AvatarUrl,
                TelegramChatId = u.TelegramChatId,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt,
                Role = u.Role
            }).ToList(),
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };
    }

    public async Task<CommentResponseDto> UpdateCommentAsync(Guid commentId, Guid userId, UpdateCommentDto dto)
    {
        var comment = await _commentRepository.GetByIdAsync(commentId);
        if (comment == null)
            throw new KeyNotFoundException("Comment not found");

        // Only author can update
        if (comment.AuthorId != userId)
            throw new UnauthorizedAccessException("You can only update your own comments");

        comment.Content = dto.Content;
        comment.UpdatedAt = DateTime.UtcNow;
        await _commentRepository.UpdateAsync(comment);

        var author = await _context.Users.FindAsync(userId);
        var mentions = JsonSerializer.Deserialize<List<Guid>>(comment.Mentions) ?? new List<Guid>();
        var mentionedUsers = new List<User>();
        foreach (var mentionId in mentions)
        {
            var user = await _context.Users.FindAsync(mentionId);
            if (user != null)
                mentionedUsers.Add(user);
        }

        return new CommentResponseDto
        {
            Id = comment.Id,
            CardId = comment.CardId,
            Content = comment.Content,
            Author = new UserResponseDto
            {
                Id = author!.Id,
                GoogleId = author.GoogleId,
                Name = author.Name,
                Email = author.Email,
                AvatarUrl = author.AvatarUrl,
                TelegramChatId = author.TelegramChatId,
                CreatedAt = author.CreatedAt,
                LastLoginAt = author.LastLoginAt,
                Role = author.Role
            },
            Mentions = mentionedUsers.Select(u => new UserResponseDto
            {
                Id = u.Id,
                GoogleId = u.GoogleId,
                Name = u.Name,
                Email = u.Email,
                AvatarUrl = u.AvatarUrl,
                TelegramChatId = u.TelegramChatId,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt,
                Role = u.Role
            }).ToList(),
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };
    }

    public async Task DeleteCommentAsync(Guid commentId, Guid userId)
    {
        var comment = await _commentRepository.GetByIdAsync(commentId);
        if (comment == null)
            throw new KeyNotFoundException("Comment not found");

        // Only author can delete
        if (comment.AuthorId != userId)
            throw new UnauthorizedAccessException("You can only delete your own comments");

        await _commentRepository.DeleteAsync(comment);
    }

    public async Task<IEnumerable<CommentResponseDto>> GetCardCommentsAsync(Guid cardId, Guid userId, int limit = 50, int offset = 0)
    {
        var card = await _cardRepository.GetByIdAsync(cardId);
        if (card == null)
            throw new KeyNotFoundException("Card not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(card.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        var comments = await _commentRepository.GetCardCommentsAsync(cardId, limit, offset);

        var result = new List<CommentResponseDto>();
        foreach (var comment in comments)
        {
            var author = await _context.Users.FindAsync(comment.AuthorId);
            var mentions = JsonSerializer.Deserialize<List<Guid>>(comment.Mentions) ?? new List<Guid>();
            var mentionedUsers = new List<User>();
            foreach (var mentionId in mentions)
            {
                var user = await _context.Users.FindAsync(mentionId);
                if (user != null)
                    mentionedUsers.Add(user);
            }

            result.Add(new CommentResponseDto
            {
                Id = comment.Id,
                CardId = comment.CardId,
                Content = comment.Content,
                Author = new UserResponseDto
                {
                    Id = author!.Id,
                    GoogleId = author.GoogleId,
                    Name = author.Name,
                    Email = author.Email,
                    AvatarUrl = author.AvatarUrl,
                    TelegramChatId = author.TelegramChatId,
                    CreatedAt = author.CreatedAt,
                    LastLoginAt = author.LastLoginAt,
                    Role = author.Role
                },
                Mentions = mentionedUsers.Select(u => new UserResponseDto
                {
                    Id = u.Id,
                    GoogleId = u.GoogleId,
                    Name = u.Name,
                    Email = u.Email,
                    AvatarUrl = u.AvatarUrl,
                    TelegramChatId = u.TelegramChatId,
                    CreatedAt = u.CreatedAt,
                    LastLoginAt = u.LastLoginAt,
                    Role = u.Role
                }).ToList(),
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt
            });
        }

        return result;
    }
}
