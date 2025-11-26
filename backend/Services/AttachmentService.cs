using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Services;

public class AttachmentService : IAttachmentService
{
    private readonly IAttachmentRepository _attachmentRepository;
    private readonly ILogger<AttachmentService> _logger;

    public AttachmentService(IAttachmentRepository attachmentRepository, ILogger<AttachmentService> logger)
    {
        _attachmentRepository = attachmentRepository;
        _logger = logger;
    }

    public Task<AttachmentResponseDto> UploadAttachmentAsync(Guid cardId, Guid userId, IFormFile file, string? name = null)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<AttachmentResponseDto> GetAttachmentByIdAsync(Guid attachmentId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task DeleteAttachmentAsync(Guid attachmentId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<IEnumerable<AttachmentResponseDto>> GetCardAttachmentsAsync(Guid cardId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }
}

