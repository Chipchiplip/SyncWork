using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("google/login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequestDto request)
    {
        try
        {
            var authUrl = await _authService.GetGoogleAuthUrlAsync(request.RedirectUri);
            return Ok(new { AuthUrl = authUrl });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initiating Google login");
            return BadRequest(new { Error = "Failed to initiate Google login", Message = ex.Message });
        }
    }

    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleCallback([FromQuery] string code, [FromQuery] string? state)
    {
        try
        {
            var response = await _authService.HandleGoogleCallbackAsync(code, state);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling Google callback");
            return Unauthorized(new { Error = "Authentication failed", Message = ex.Message });
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        try
        {
            var response = await _authService.RefreshTokenAsync(request.RefreshToken);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            return Unauthorized(new { Error = "Invalid refresh token", Message = ex.Message });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutRequestDto request)
    {
        try
        {
            await _authService.LogoutAsync(request.RefreshToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return BadRequest(new { Error = "Logout failed", Message = ex.Message });
        }
    }
}

public class GoogleLoginRequestDto
{
    public string RedirectUri { get; set; } = string.Empty;
}

