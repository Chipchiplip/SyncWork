namespace TaskManager.DTOs;

public class UserResponseDto
{
    public Guid Id { get; set; }
    public string GoogleId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? TelegramChatId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public string Role { get; set; } = string.Empty;
}

public class UpdateUserDto
{
    public string? Name { get; set; }
    public string? AvatarUrl { get; set; }
    public string? TelegramChatId { get; set; }
}

public class UserSearchResponseDto
{
    public IEnumerable<UserResponseDto> Users { get; set; } = new List<UserResponseDto>();
    public int Total { get; set; }
}

