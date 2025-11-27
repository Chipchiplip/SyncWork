using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Controllers;

[ApiController]
[Route("api/cards/{cardId}/attachments")]
[Authorize]
public class AttachmentsController : ControllerBase
{
    private readonly IAttachmentService _attachmentService;
    private readonly ILogger<AttachmentsController> _logger;

    public AttachmentsController(IAttachmentService attachmentService, ILogger<AttachmentsController> logger)
    {
        _attachmentService = attachmentService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> UploadAttachment(Guid cardId, IFormFile file, [FromForm] string? name = null)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            if (file == null || file.Length == 0)
                return BadRequest(new { Error = "File is required" });

            var attachment = await _attachmentService.UploadAttachmentAsync(cardId, userId.Value, file, name);
            return CreatedAtAction(nameof(GetAttachment), new { attachmentId = attachment.Id }, attachment);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Error = "Invalid file", Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading attachment");
            return BadRequest(new { Error = "Failed to upload attachment", Message = ex.Message });
        }
    }

    [HttpGet("{attachmentId}")]
    public async Task<IActionResult> GetAttachment(Guid attachmentId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var attachment = await _attachmentService.GetAttachmentByIdAsync(attachmentId, userId.Value);
            return Ok(attachment);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting attachment");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetCardAttachments(Guid cardId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var attachments = await _attachmentService.GetCardAttachmentsAsync(cardId, userId.Value);
            return Ok(new { Attachments = attachments, Total = attachments.Count() });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting attachments");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpDelete("{attachmentId}")]
    public async Task<IActionResult> DeleteAttachment(Guid attachmentId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            await _attachmentService.DeleteAttachmentAsync(attachmentId, userId.Value);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting attachment");
            return BadRequest(new { Error = "Failed to delete attachment", Message = ex.Message });
        }
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdClaim, out var userId))
            return userId;
        return null;
    }
}

