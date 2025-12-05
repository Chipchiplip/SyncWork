using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Controllers;

[ApiController]
[Route("api/cards/{cardId}/checklist")]
[Authorize]
public class ChecklistController : ControllerBase
{
    private readonly IChecklistService _checklistService;
    private readonly ILogger<ChecklistController> _logger;

    public ChecklistController(IChecklistService checklistService, ILogger<ChecklistController> logger)
    {
        _checklistService = checklistService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetCardChecklist(Guid cardId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var progress = await _checklistService.GetCardChecklistItemsAsync(cardId, userId.Value);
            return Ok(new { Progress = progress });
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
            _logger.LogError(ex, "Error getting checklist");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateChecklistItem(Guid cardId, [FromBody] CreateChecklistItemDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var item = await _checklistService.CreateChecklistItemAsync(cardId, userId.Value, dto);
            return CreatedAtAction(nameof(GetCardChecklist), new { cardId }, item);
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
            _logger.LogError(ex, "Error creating checklist item");
            return BadRequest(new { Error = "Failed to create checklist item", Message = ex.Message });
        }
    }

    [HttpPatch("{itemId}")]
    public async Task<IActionResult> UpdateChecklistItem(Guid cardId, Guid itemId, [FromBody] UpdateChecklistItemDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var item = await _checklistService.UpdateChecklistItemAsync(itemId, userId.Value, dto);
            return Ok(item);
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
            _logger.LogError(ex, "Error updating checklist item");
            return BadRequest(new { Error = "Failed to update checklist item", Message = ex.Message });
        }
    }

    [HttpPatch("{itemId}/toggle")]
    public async Task<IActionResult> ToggleChecklistItem(Guid cardId, Guid itemId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var item = await _checklistService.ToggleChecklistItemAsync(itemId, userId.Value);
            return Ok(item);
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
            _logger.LogError(ex, "Error toggling checklist item");
            return BadRequest(new { Error = "Failed to toggle checklist item", Message = ex.Message });
        }
    }

    [HttpDelete("{itemId}")]
    public async Task<IActionResult> DeleteChecklistItem(Guid cardId, Guid itemId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            await _checklistService.DeleteChecklistItemAsync(itemId, userId.Value);
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
            _logger.LogError(ex, "Error deleting checklist item");
            return BadRequest(new { Error = "Failed to delete checklist item", Message = ex.Message });
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
