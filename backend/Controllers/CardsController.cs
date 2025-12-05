using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class CardsController : ControllerBase
{
    private readonly ICardService _cardService;
    private readonly ILogger<CardsController> _logger;

    public CardsController(ICardService cardService, ILogger<CardsController> logger)
    {
        _cardService = cardService;
        _logger = logger;
    }

    [HttpPost("lists/{listId}/cards")]
    public async Task<IActionResult> CreateCard(Guid listId, [FromBody] CreateCardDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var card = await _cardService.CreateCardAsync(listId, userId.Value, dto);
            return CreatedAtAction(nameof(GetCard), new { cardId = card.Id }, card);
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
            _logger.LogError(ex, "Error creating card");
            return BadRequest(new { Error = "Failed to create card", Message = ex.Message });
        }
    }

    [HttpGet("cards/{cardId}")]
    public async Task<IActionResult> GetCard(Guid cardId, [FromQuery] bool includeChecklist = true, [FromQuery] bool includeComments = true, [FromQuery] bool includeAttachments = true)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var card = await _cardService.GetCardByIdAsync(cardId, userId.Value, includeChecklist, includeComments, includeAttachments);
            return Ok(card);
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
            _logger.LogError(ex, "Error getting card");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpPatch("cards/{cardId}")]
    public async Task<IActionResult> UpdateCard(Guid cardId, [FromBody] UpdateCardDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var card = await _cardService.UpdateCardAsync(cardId, userId.Value, dto);
            return Ok(card);
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
            _logger.LogError(ex, "Error updating card");
            return BadRequest(new { Error = "Failed to update card", Message = ex.Message });
        }
    }

    [HttpDelete("cards/{cardId}")]
    public async Task<IActionResult> DeleteCard(Guid cardId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            await _cardService.DeleteCardAsync(cardId, userId.Value);
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
            _logger.LogError(ex, "Error deleting card");
            return BadRequest(new { Error = "Failed to delete card", Message = ex.Message });
        }
    }

    [HttpPatch("cards/{cardId}/move")]
    public async Task<IActionResult> MoveCard(Guid cardId, [FromBody] MoveCardDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var card = await _cardService.MoveCardAsync(cardId, userId.Value, dto);
            return Ok(card);
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
            return BadRequest(new { Error = "Invalid request", Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error moving card");
            return BadRequest(new { Error = "Failed to move card", Message = ex.Message });
        }
    }

    [HttpPost("cards/{cardId}/copy")]
    public async Task<IActionResult> CopyCard(Guid cardId, [FromBody] CopyCardDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var card = await _cardService.CopyCardAsync(cardId, userId.Value, dto);
            return Ok(card);
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
            return BadRequest(new { Error = "Invalid request", Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error copying card");
            return BadRequest(new { Error = "Failed to copy card", Message = ex.Message });
        }
    }

    [HttpPatch("cards/{cardId}/status")]
    public async Task<IActionResult> UpdateCardStatus(Guid cardId, [FromBody] UpdateCardStatusDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var card = await _cardService.UpdateCardStatusAsync(cardId, userId.Value, dto.Status);
            return Ok(card);
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
            return BadRequest(new { Error = "Invalid status", Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating card status");
            return BadRequest(new { Error = "Failed to update card status", Message = ex.Message });
        }
    }

    [HttpPost("cards/{cardId}/approve")]
    public async Task<IActionResult> ApproveCard(Guid cardId, [FromBody] ApproveCardDto? dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var card = await _cardService.ApproveCardAsync(cardId, userId.Value, dto?.Comment);
            return Ok(card);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Error = "Invalid operation", Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving card");
            return BadRequest(new { Error = "Failed to approve card", Message = ex.Message });
        }
    }

    [HttpPost("cards/{cardId}/reject")]
    public async Task<IActionResult> RejectCard(Guid cardId, [FromBody] RejectCardDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var card = await _cardService.RejectCardAsync(cardId, userId.Value, dto.Reason);
            return Ok(card);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Error = "Invalid operation", Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting card");
            return BadRequest(new { Error = "Failed to reject card", Message = ex.Message });
        }
    }

    [HttpGet("lists/{listId}/cards")]
    public async Task<IActionResult> GetListCards(Guid listId, [FromQuery] string? status = null, [FromQuery] Guid? assigneeId = null, [FromQuery] Guid? labelId = null, [FromQuery] string? dueDate = null)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var cards = await _cardService.GetListCardsAsync(listId, userId.Value, status, assigneeId, labelId, dueDate);
            return Ok(new CardListResponseDto { Cards = cards, Total = cards.Count() });
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
            _logger.LogError(ex, "Error getting list cards");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpGet("boards/{boardId}/cards/search")]
    public async Task<IActionResult> SearchCards(Guid boardId, [FromQuery] string q, [FromQuery] string? status = null, [FromQuery] Guid? assigneeId = null, [FromQuery] Guid? labelId = null, [FromQuery] string? dueDate = null, [FromQuery] int limit = 20, [FromQuery] int offset = 0)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            if (string.IsNullOrWhiteSpace(q))
                return BadRequest(new { Error = "Query parameter 'q' is required" });

            var cards = await _cardService.SearchCardsAsync(boardId, userId.Value, q, status, assigneeId, labelId, dueDate, limit, offset);
            return Ok(new CardListResponseDto { Cards = cards, Total = cards.Count() });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching cards");
            return StatusCode(500, new { Error = "Internal server error" });
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

public class UpdateCardStatusDto
{
    public string Status { get; set; } = string.Empty;
}

public class ApproveCardDto
{
    public string? Comment { get; set; }
}

public class RejectCardDto
{
    public string Reason { get; set; } = string.Empty;
}

