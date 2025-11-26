using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository userRepository, ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public Task<UserResponseDto> GetCurrentUserAsync(Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<UserResponseDto> UpdateUserAsync(Guid userId, UpdateUserDto dto)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<UserResponseDto> GetUserByIdAsync(Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<IEnumerable<UserResponseDto>> SearchUsersAsync(string query, int limit = 20)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }
}

