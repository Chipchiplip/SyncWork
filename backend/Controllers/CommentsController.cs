using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Controllers;

[ApiController]
[Route("api/cards/{cardId}/comments")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;
    private readonly ILogger<CommentsController> _logger;

    public CommentsController(ICommentService commentService, ILogger<CommentsController> logger)
    {
        _commentService = commentService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreateComment(Guid cardId, [FromBody] CreateCommentDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var comment = await _commentService.CreateCommentAsync(cardId, userId.Value, dto);
            return CreatedAtAction(nameof(GetComment), new { commentId = comment.Id }, comment);
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
            _logger.LogError(ex, "Error creating comment");
            return BadRequest(new { Error = "Failed to create comment", Message = ex.Message });
        }
    }

    [HttpGet("{commentId}")]
    public IActionResult GetComment(Guid commentId)
    {
        // This would require a GetCommentById method in service
        return NotFound();
    }

    [HttpGet]
    public async Task<IActionResult> GetCardComments(Guid cardId, [FromQuery] int limit = 50, [FromQuery] int offset = 0)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var comments = await _commentService.GetCardCommentsAsync(cardId, userId.Value, limit, offset);
            return Ok(new { Comments = comments, Total = comments.Count(), Limit = limit, Offset = offset });
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
            _logger.LogError(ex, "Error getting comments");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpPatch("{commentId}")]
    public async Task<IActionResult> UpdateComment(Guid commentId, [FromBody] UpdateCommentDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var comment = await _commentService.UpdateCommentAsync(commentId, userId.Value, dto);
            return Ok(comment);
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
            _logger.LogError(ex, "Error updating comment");
            return BadRequest(new { Error = "Failed to update comment", Message = ex.Message });
        }
    }

    [HttpDelete("{commentId}")]
    public async Task<IActionResult> DeleteComment(Guid commentId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            await _commentService.DeleteCommentAsync(commentId, userId.Value);
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
            _logger.LogError(ex, "Error deleting comment");
            return BadRequest(new { Error = "Failed to delete comment", Message = ex.Message });
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

