using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Services;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepository;
    private readonly ILogger<CommentService> _logger;

    public CommentService(ICommentRepository commentRepository, ILogger<CommentService> logger)
    {
        _commentRepository = commentRepository;
        _logger = logger;
    }

    public Task<CommentResponseDto> CreateCommentAsync(Guid cardId, Guid userId, CreateCommentDto dto)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<CommentResponseDto> UpdateCommentAsync(Guid commentId, Guid userId, UpdateCommentDto dto)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task DeleteCommentAsync(Guid commentId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<IEnumerable<CommentResponseDto>> GetCardCommentsAsync(Guid cardId, Guid userId, int limit = 50, int offset = 0)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }
}

