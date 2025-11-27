using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.DTOs;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository userRepository, ApplicationDbContext context, ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _context = context;
        _logger = logger;
    }

    public async Task<UserResponseDto> GetCurrentUserAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("User not found");

        return MapToDto(user);
    }

    public async Task<UserResponseDto> UpdateUserAsync(Guid userId, UpdateUserDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("User not found");

        if (!string.IsNullOrEmpty(dto.Name))
            user.Name = dto.Name;

        if (dto.AvatarUrl != null)
            user.AvatarUrl = dto.AvatarUrl;

        if (dto.TelegramChatId != null)
            user.TelegramChatId = dto.TelegramChatId;

        await _userRepository.UpdateAsync(user);

        return MapToDto(user);
    }

    public async Task<UserResponseDto> GetUserByIdAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("User not found");

        return MapToDto(user);
    }

    public async Task<IEnumerable<UserResponseDto>> SearchUsersAsync(string query, int limit = 20)
    {
        var users = await _userRepository.SearchAsync(query, limit);
        return users.Select(MapToDto);
    }

    private UserResponseDto MapToDto(User user)
    {
        return new UserResponseDto
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
        };
    }
}
