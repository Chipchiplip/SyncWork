using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.DTOs;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Services;

public class AttachmentService : IAttachmentService
{
    private readonly IAttachmentRepository _attachmentRepository;
    private readonly ICardRepository _cardRepository;
    private readonly IBoardRepository _boardRepository;
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IActivityLogService _activityLogService;
    private readonly ILogger<AttachmentService> _logger;

    public AttachmentService(
        IAttachmentRepository attachmentRepository,
        ICardRepository cardRepository,
        IBoardRepository boardRepository,
        ApplicationDbContext context,
        IConfiguration configuration,
        IActivityLogService activityLogService,
        ILogger<AttachmentService> logger)
    {
        _attachmentRepository = attachmentRepository;
        _cardRepository = cardRepository;
        _boardRepository = boardRepository;
        _context = context;
        _configuration = configuration;
        _activityLogService = activityLogService;
        _logger = logger;
    }

    public async Task<AttachmentResponseDto> UploadAttachmentAsync(Guid cardId, Guid userId, IFormFile file, string? name = null)
    {
        var card = await _cardRepository.GetByIdAsync(cardId);
        if (card == null)
            throw new KeyNotFoundException("Card not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(card.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        // Validate file
        var maxSize = _configuration.GetValue<long>("FileUpload:MaxFileSize", 10485760); // 10MB default
        if (file.Length > maxSize)
            throw new ArgumentException($"File size exceeds maximum allowed size of {maxSize} bytes");

        var allowedExtensions = _configuration.GetSection("FileUpload:AllowedExtensions").Get<string[]>() 
            ?? new[] { ".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx" };
        var fileExtension = Path.GetExtension(file.FileName).ToLower();
        if (!allowedExtensions.Contains(fileExtension))
            throw new ArgumentException($"File extension '{fileExtension}' is not allowed");

        // Create upload directory if not exists
        var uploadPath = _configuration["FileUpload:UploadPath"] ?? "wwwroot/uploads";
        var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), uploadPath);
        if (!Directory.Exists(uploadDir))
            Directory.CreateDirectory(uploadDir);

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(uploadDir, fileName);
        var fileUrl = $"/uploads/{fileName}";

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Create attachment record
        var attachment = new Attachment
        {
            Id = Guid.NewGuid(),
            CardId = cardId,
            Name = name ?? file.FileName,
            Url = fileUrl,
            MimeType = file.ContentType,
            Size = file.Length,
            UploadedById = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _attachmentRepository.AddAsync(attachment);

        // Log activity
        await _activityLogService.LogActivityAsync(
            card.BoardId,
            card.Id,
            userId,
            "attachment",
            $"Uploaded attachment '{attachment.Name}' to card '{card.Title}'",
            new { fileName = attachment.Name, fileSize = attachment.Size }
        );

        var uploadedBy = await _context.Users.FindAsync(userId);

        return new AttachmentResponseDto
        {
            Id = attachment.Id,
            CardId = attachment.CardId,
            Name = attachment.Name,
            Url = attachment.Url,
            MimeType = attachment.MimeType,
            Size = attachment.Size,
            UploadedBy = new UserResponseDto
            {
                Id = uploadedBy!.Id,
                GoogleId = uploadedBy.GoogleId,
                Name = uploadedBy.Name,
                Email = uploadedBy.Email,
                AvatarUrl = uploadedBy.AvatarUrl,
                TelegramChatId = uploadedBy.TelegramChatId,
                CreatedAt = uploadedBy.CreatedAt,
                LastLoginAt = uploadedBy.LastLoginAt,
                Role = uploadedBy.Role
            },
            CreatedAt = attachment.CreatedAt
        };
    }

    public async Task<AttachmentResponseDto> GetAttachmentByIdAsync(Guid attachmentId, Guid userId)
    {
        var attachment = await _attachmentRepository.GetByIdAsync(attachmentId);
        if (attachment == null)
            throw new KeyNotFoundException("Attachment not found");

        var card = await _cardRepository.GetByIdAsync(attachment.CardId);
        if (card == null)
            throw new KeyNotFoundException("Card not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(card.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        var uploadedBy = await _context.Users.FindAsync(attachment.UploadedById);

        return new AttachmentResponseDto
        {
            Id = attachment.Id,
            CardId = attachment.CardId,
            Name = attachment.Name,
            Url = attachment.Url,
            MimeType = attachment.MimeType,
            Size = attachment.Size,
            UploadedBy = new UserResponseDto
            {
                Id = uploadedBy!.Id,
                GoogleId = uploadedBy.GoogleId,
                Name = uploadedBy.Name,
                Email = uploadedBy.Email,
                AvatarUrl = uploadedBy.AvatarUrl,
                TelegramChatId = uploadedBy.TelegramChatId,
                CreatedAt = uploadedBy.CreatedAt,
                LastLoginAt = uploadedBy.LastLoginAt,
                Role = uploadedBy.Role
            },
            CreatedAt = attachment.CreatedAt
        };
    }

    public async Task DeleteAttachmentAsync(Guid attachmentId, Guid userId)
    {
        var attachment = await _attachmentRepository.GetByIdAsync(attachmentId);
        if (attachment == null)
            throw new KeyNotFoundException("Attachment not found");

        var card = await _cardRepository.GetByIdAsync(attachment.CardId);
        if (card == null)
            throw new KeyNotFoundException("Card not found");

        // Check permissions: uploader or assignee can delete
        var member = await _boardRepository.GetBoardMemberAsync(card.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        if (attachment.UploadedById != userId && card.AssigneeId != userId)
            throw new UnauthorizedAccessException("Only uploader or card assignee can delete attachment");

        // Delete file
        var uploadPath = _configuration["FileUpload:UploadPath"] ?? "wwwroot/uploads";
        var fileName = Path.GetFileName(attachment.Url);
        var filePath = Path.Combine(Directory.GetCurrentDirectory(), uploadPath, fileName);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        await _attachmentRepository.DeleteAsync(attachment);

        // Log activity
        await _activityLogService.LogActivityAsync(
            card.BoardId,
            card.Id,
            userId,
            "delete_attachment",
            $"Deleted attachment '{attachment.Name}' from card '{card.Title}'",
            new { fileName = attachment.Name }
        );
    }

    public async Task<IEnumerable<AttachmentResponseDto>> GetCardAttachmentsAsync(Guid cardId, Guid userId)
    {
        var card = await _cardRepository.GetByIdAsync(cardId);
        if (card == null)
            throw new KeyNotFoundException("Card not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(card.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        var attachments = await _attachmentRepository.GetCardAttachmentsAsync(cardId);

        var result = new List<AttachmentResponseDto>();
        foreach (var attachment in attachments)
        {
            var uploadedBy = await _context.Users.FindAsync(attachment.UploadedById);

            result.Add(new AttachmentResponseDto
            {
                Id = attachment.Id,
                CardId = attachment.CardId,
                Name = attachment.Name,
                Url = attachment.Url,
                MimeType = attachment.MimeType,
                Size = attachment.Size,
                UploadedBy = new UserResponseDto
                {
                    Id = uploadedBy!.Id,
                    GoogleId = uploadedBy.GoogleId,
                    Name = uploadedBy.Name,
                    Email = uploadedBy.Email,
                    AvatarUrl = uploadedBy.AvatarUrl,
                    TelegramChatId = uploadedBy.TelegramChatId,
                    CreatedAt = uploadedBy.CreatedAt,
                    LastLoginAt = uploadedBy.LastLoginAt,
                    Role = uploadedBy.Role
                },
                CreatedAt = attachment.CreatedAt
            });
        }

        return result;
    }
}
