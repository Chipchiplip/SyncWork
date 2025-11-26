using TaskManager.DTOs;

namespace TaskManager.Interfaces;

public interface IUserService
{
    Task<UserResponseDto> GetCurrentUserAsync(Guid userId);
    Task<UserResponseDto> UpdateUserAsync(Guid userId, UpdateUserDto dto);
    Task<UserResponseDto> GetUserByIdAsync(Guid userId);
    Task<IEnumerable<UserResponseDto>> SearchUsersAsync(string query, int limit = 20);
}

