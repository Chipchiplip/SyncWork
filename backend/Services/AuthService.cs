using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.DTOs;
using TaskManager.Helpers;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        ApplicationDbContext context,
        IConfiguration configuration,
        JwtHelper jwtHelper,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _context = context;
        _configuration = configuration;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    public Task<string> GetGoogleAuthUrlAsync(string redirectUri)
    {
        var googleSettings = _configuration.GetSection("GoogleOAuth");
        var clientId = googleSettings["ClientId"];
        var state = Guid.NewGuid().ToString();

        var authUrl = $"https://accounts.google.com/o/oauth2/v2/auth?" +
            $"client_id={clientId}&" +
            $"redirect_uri={Uri.EscapeDataString(redirectUri)}&" +
            $"response_type=code&" +
            $"scope=openid email profile&" +
            $"state={state}&" +
            $"access_type=offline&" +
            $"prompt=consent";

        return Task.FromResult(authUrl);
    }

    public async Task<AuthResponseDto> HandleGoogleCallbackAsync(string code, string? state)
    {
        try
        {
            var googleSettings = _configuration.GetSection("GoogleOAuth");
            var clientId = googleSettings["ClientId"];
            var clientSecret = googleSettings["ClientSecret"];
            var redirectUri = googleSettings["RedirectUri"];

            // Exchange code for token
            var tokenRequest = new
            {
                code = code,
                client_id = clientId,
                client_secret = clientSecret,
                redirect_uri = redirectUri,
                grant_type = "authorization_code"
            };

            using var httpClient = new HttpClient();
            var tokenResponse = await httpClient.PostAsync(
                "https://oauth2.googleapis.com/token",
                new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("code", code),
                    new KeyValuePair<string, string>("client_id", clientId!),
                    new KeyValuePair<string, string>("client_secret", clientSecret!),
                    new KeyValuePair<string, string>("redirect_uri", redirectUri!),
                    new KeyValuePair<string, string>("grant_type", "authorization_code")
                })
            );

            if (!tokenResponse.IsSuccessStatusCode)
            {
                var errorContent = await tokenResponse.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to exchange code for token. Status: {tokenResponse.StatusCode}, Content: {errorContent}");
                throw new Exception($"Failed to exchange code for token: {tokenResponse.StatusCode}");
            }

            var tokenContent = await tokenResponse.Content.ReadAsStringAsync();
            var tokenData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(tokenContent);
            var accessToken = tokenData?["access_token"]?.ToString();

            if (string.IsNullOrEmpty(accessToken))
            {
                throw new Exception("Access token not received");
            }

            // Get user info from Google
            var userInfoResponse = await httpClient.GetAsync(
                $"https://www.googleapis.com/oauth2/v2/userinfo?access_token={accessToken}"
            );

            if (!userInfoResponse.IsSuccessStatusCode)
            {
                var errorContent = await userInfoResponse.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to get user info from Google. Status: {userInfoResponse.StatusCode}, Content: {errorContent}");
                throw new Exception("Failed to get user info from Google");
            }

            var userInfoContent = await userInfoResponse.Content.ReadAsStringAsync();
            var jsonOptions = new System.Text.Json.JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var userInfo = System.Text.Json.JsonSerializer.Deserialize<GoogleUserInfo>(userInfoContent, jsonOptions);

            if (userInfo == null || string.IsNullOrEmpty(userInfo.Id))
            {
                _logger.LogError($"Invalid user info from Google. Content: {userInfoContent}");
                throw new Exception("Invalid user info from Google");
            }

            // Find or create user
            var user = await _userRepository.GetByGoogleIdAsync(userInfo.Id);

            if (user == null)
            {
                // Create new user
                user = new User
                {
                    Id = Guid.NewGuid(),
                    GoogleId = userInfo.Id,
                    Name = userInfo.Name ?? userInfo.Email ?? "User",
                    Email = userInfo.Email ?? "",
                    AvatarUrl = userInfo.Picture,
                    Role = "user",
                    CreatedAt = DateTime.UtcNow,
                    LastLoginAt = DateTime.UtcNow
                };

                await _userRepository.AddAsync(user);
            }
            else
            {
                // Update existing user
                user.Name = userInfo.Name ?? user.Name;
                user.AvatarUrl = userInfo.Picture ?? user.AvatarUrl;
                user.LastLoginAt = DateTime.UtcNow;
                await _userRepository.UpdateAsync(user);
            }

            // Generate JWT tokens
            var jwtToken = _jwtHelper.GenerateToken(user);
            var refreshToken = _jwtHelper.GenerateRefreshToken();

            // Save refresh token
            var refreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(int.Parse(_configuration["JwtSettings:RefreshTokenExpirationDays"] ?? "7")),
                CreatedAt = DateTime.UtcNow
            };

            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangesAsync();

            return new AuthResponseDto
            {
                Token = jwtToken,
                RefreshToken = refreshToken,
                User = new UserResponseDto
                {
                    Id = user.Id,
                    GoogleId = user.GoogleId,
                    Name = user.Name,
                    Email = user.Email,
                    AvatarUrl = user.AvatarUrl,
                    TelegramChatId = user.TelegramChatId,
                    CreatedAt = user.CreatedAt,
                    LastLoginAt = user.LastLoginAt,
                    Role = user.Role
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling Google OAuth callback");
            throw;
        }
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var tokenEntity = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow);

        if (tokenEntity == null)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token");
        }

        var user = tokenEntity.User;
        var newJwtToken = _jwtHelper.GenerateToken(user);
        var newRefreshToken = _jwtHelper.GenerateRefreshToken();

        // Revoke old token
        tokenEntity.IsRevoked = true;
        _context.RefreshTokens.Update(tokenEntity);

        // Save new refresh token
        var newRefreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(int.Parse(_configuration["JwtSettings:RefreshTokenExpirationDays"] ?? "7")),
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(newRefreshTokenEntity);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = newJwtToken,
            RefreshToken = newRefreshToken,
            User = new UserResponseDto
            {
                Id = user.Id,
                GoogleId = user.GoogleId,
                Name = user.Name,
                Email = user.Email,
                AvatarUrl = user.AvatarUrl,
                TelegramChatId = user.TelegramChatId,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                Role = user.Role
            }
        };
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var tokenEntity = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (tokenEntity != null)
        {
            tokenEntity.IsRevoked = true;
            _context.RefreshTokens.Update(tokenEntity);
            await _context.SaveChangesAsync();
        }
    }

    private class GoogleUserInfo
    {
        public string? Id { get; set; }
        public string? Email { get; set; }
        public string? Name { get; set; }
        public string? Picture { get; set; }
    }
}
