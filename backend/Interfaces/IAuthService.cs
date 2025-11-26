using TaskManager.DTOs;

namespace TaskManager.Interfaces;

public interface IAuthService
{
    Task<string> GetGoogleAuthUrlAsync(string redirectUri);
    Task<AuthResponseDto> HandleGoogleCallbackAsync(string code, string? state);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
}

