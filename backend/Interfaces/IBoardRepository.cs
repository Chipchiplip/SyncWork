using TaskManager.Models;

namespace TaskManager.Interfaces;

public interface IBoardRepository : IRepository<Board>
{
    Task<IEnumerable<Board>> GetUserBoardsAsync(Guid userId);
    Task<BoardMember?> GetBoardMemberAsync(Guid boardId, Guid userId);
    Task<IEnumerable<BoardMember>> GetBoardMembersAsync(Guid boardId);
    Task<BoardMember> AddBoardMemberAsync(BoardMember member);
    Task RemoveBoardMemberAsync(BoardMember member);
    Task UpdateBoardMemberRoleAsync(BoardMember member);
}

