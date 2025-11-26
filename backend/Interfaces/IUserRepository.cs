using TaskManager.Models;

namespace TaskManager.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByGoogleIdAsync(string googleId);
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> SearchAsync(string query, int limit = 20);
}

