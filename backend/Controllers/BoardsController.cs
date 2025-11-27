using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Controllers;

[ApiController]
[Route("api/boards")]
[Authorize]
public class BoardsController : ControllerBase
{
    private readonly IBoardService _boardService;
    private readonly ILogger<BoardsController> _logger;

    public BoardsController(IBoardService boardService, ILogger<BoardsController> logger)
    {
        _boardService = boardService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBoard([FromBody] CreateBoardDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var board = await _boardService.CreateBoardAsync(userId.Value, dto);
            return CreatedAtAction(nameof(GetBoard), new { boardId = board.Id }, board);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating board");
            return BadRequest(new { Error = "Failed to create board", Message = ex.Message });
        }
    }

    [HttpGet("{boardId}")]
    public async Task<IActionResult> GetBoard(Guid boardId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var board = await _boardService.GetBoardByIdAsync(boardId, userId.Value);
            return Ok(board);
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
            _logger.LogError(ex, "Error getting board");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetBoards([FromQuery] int limit = 50, [FromQuery] int offset = 0, [FromQuery] string? sortBy = null, [FromQuery] string? order = null)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var boards = await _boardService.GetUserBoardsAsync(userId.Value, limit, offset, sortBy, order);
            return Ok(new BoardListResponseDto
            {
                Boards = boards,
                Total = boards.Count(),
                Limit = limit,
                Offset = offset
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting boards");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpPatch("{boardId}")]
    public async Task<IActionResult> UpdateBoard(Guid boardId, [FromBody] UpdateBoardDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var board = await _boardService.UpdateBoardAsync(boardId, userId.Value, dto);
            return Ok(board);
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
            _logger.LogError(ex, "Error updating board");
            return BadRequest(new { Error = "Failed to update board", Message = ex.Message });
        }
    }

    [HttpDelete("{boardId}")]
    public async Task<IActionResult> DeleteBoard(Guid boardId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            await _boardService.DeleteBoardAsync(boardId, userId.Value);
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
            _logger.LogError(ex, "Error deleting board");
            return BadRequest(new { Error = "Failed to delete board", Message = ex.Message });
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

