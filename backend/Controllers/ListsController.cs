using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Controllers;

[ApiController]
[Route("api/boards/{boardId}/lists")]
[Authorize]
public class ListsController : ControllerBase
{
    private readonly IListService _listService;
    private readonly ILogger<ListsController> _logger;

    public ListsController(IListService listService, ILogger<ListsController> logger)
    {
        _listService = listService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreateList(Guid boardId, [FromBody] CreateListDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var list = await _listService.CreateListAsync(boardId, userId.Value, dto);
            return CreatedAtAction(nameof(GetList), new { boardId = boardId, listId = list.Id }, list);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating list");
            return BadRequest(new { Error = "Failed to create list", Message = ex.Message });
        }
    }

    [HttpGet("{listId}")]
    public async Task<IActionResult> GetList(Guid listId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var list = await _listService.GetListByIdAsync(listId, userId.Value);
            return Ok(list);
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
            _logger.LogError(ex, "Error getting list");
            return StatusCode(500, new { Error = "Internal server error", Message = ex.Message, StackTrace = ex.StackTrace });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetBoardLists(Guid boardId, [FromQuery] bool includeCards = false)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var lists = await _listService.GetBoardListsAsync(boardId, userId.Value, includeCards);
            return Ok(new { Lists = lists, Total = lists.Count() });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting lists");
            return StatusCode(500, new { Error = "Internal server error", Message = ex.Message, StackTrace = ex.StackTrace });
        }
    }

    [HttpPatch("{listId}")]
    public async Task<IActionResult> UpdateList(Guid listId, [FromBody] UpdateListDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var list = await _listService.UpdateListAsync(listId, userId.Value, dto);
            return Ok(list);
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
            _logger.LogError(ex, "Error updating list");
            return BadRequest(new { Error = "Failed to update list", Message = ex.Message });
        }
    }

    [HttpDelete("{listId}")]
    public async Task<IActionResult> DeleteList(Guid listId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            await _listService.DeleteListAsync(listId, userId.Value);
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
            _logger.LogError(ex, "Error deleting list");
            return BadRequest(new { Error = "Failed to delete list", Message = ex.Message });
        }
    }

    [HttpPatch("reorder")]
    public async Task<IActionResult> ReorderLists(Guid boardId, [FromBody] ReorderListsDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            await _listService.ReorderListsAsync(boardId, userId.Value, dto);
            return Ok(new { Message = "Lists reordered successfully" });
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
            _logger.LogError(ex, "Error reordering lists");
            return BadRequest(new { Error = "Failed to reorder lists", Message = ex.Message });
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

