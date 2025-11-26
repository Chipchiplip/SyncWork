using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.Interfaces;
using TaskManager.Models;

namespace TaskManager.Repositories;

public class BoardRepository : BaseRepository<Board>, IBoardRepository
{
    public BoardRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Board>> GetUserBoardsAsync(Guid userId)
    {
        return await _context.Boards
            .Where(b => b.OwnerId == userId || 
                       _context.BoardMembers.Any(bm => bm.BoardId == b.Id && bm.UserId == userId))
            .OrderByDescending(b => b.UpdatedAt)
            .ToListAsync();
    }

    public async Task<BoardMember?> GetBoardMemberAsync(Guid boardId, Guid userId)
    {
        return await _context.BoardMembers
            .FirstOrDefaultAsync(bm => bm.BoardId == boardId && bm.UserId == userId);
    }

    public async Task<IEnumerable<BoardMember>> GetBoardMembersAsync(Guid boardId)
    {
        return await _context.BoardMembers
            .Include(bm => bm.User)
            .Where(bm => bm.BoardId == boardId)
            .OrderBy(bm => bm.Role)
            .ThenBy(bm => bm.JoinedAt)
            .ToListAsync();
    }

    public async Task<BoardMember> AddBoardMemberAsync(BoardMember member)
    {
        await _context.BoardMembers.AddAsync(member);
        await _context.SaveChangesAsync();
        return member;
    }

    public async Task RemoveBoardMemberAsync(BoardMember member)
    {
        _context.BoardMembers.Remove(member);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateBoardMemberRoleAsync(BoardMember member)
    {
        _context.BoardMembers.Update(member);
        await _context.SaveChangesAsync();
    }
}

