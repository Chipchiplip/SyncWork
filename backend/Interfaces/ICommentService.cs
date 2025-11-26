using TaskManager.DTOs;

namespace TaskManager.Interfaces;

public interface ICommentService
{
    Task<CommentResponseDto> CreateCommentAsync(Guid cardId, Guid userId, CreateCommentDto dto);
    Task<CommentResponseDto> UpdateCommentAsync(Guid commentId, Guid userId, UpdateCommentDto dto);
    Task DeleteCommentAsync(Guid commentId, Guid userId);
    Task<IEnumerable<CommentResponseDto>> GetCardCommentsAsync(Guid cardId, Guid userId, int limit = 50, int offset = 0);
}

