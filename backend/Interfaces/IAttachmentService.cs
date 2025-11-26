using TaskManager.DTOs;

namespace TaskManager.Interfaces;

public interface IAttachmentService
{
    Task<AttachmentResponseDto> UploadAttachmentAsync(Guid cardId, Guid userId, IFormFile file, string? name = null);
    Task<AttachmentResponseDto> GetAttachmentByIdAsync(Guid attachmentId, Guid userId);
    Task DeleteAttachmentAsync(Guid attachmentId, Guid userId);
    Task<IEnumerable<AttachmentResponseDto>> GetCardAttachmentsAsync(Guid cardId, Guid userId);
}

