using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IUserRepository userRepository, ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public Task<string> GetGoogleAuthUrlAsync(string redirectUri)
    {
        // TODO: Implement Google OAuth URL generation
        throw new NotImplementedException();
    }

    public Task<AuthResponseDto> HandleGoogleCallbackAsync(string code, string? state)
    {
        // TODO: Implement Google OAuth callback handling
        throw new NotImplementedException();
    }

    public Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        // TODO: Implement token refresh
        throw new NotImplementedException();
    }

    public Task LogoutAsync(string refreshToken)
    {
        // TODO: Implement logout
        throw new NotImplementedException();
    }
}

