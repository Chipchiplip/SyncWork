using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.DTOs;
using TaskManager.Interfaces;
using TaskManager.Models;
using System.Text.Json;

namespace TaskManager.Services;

public class CardService : ICardService
{
    private readonly ICardRepository _cardRepository;
    private readonly IBoardRepository _boardRepository;
    private readonly IListRepository _listRepository;
    private readonly IChecklistRepository _checklistRepository;
    private readonly ILabelRepository _labelRepository;
    private readonly ApplicationDbContext _context;
    private readonly IActivityLogService _activityLogService;
    private readonly ILogger<CardService> _logger;

    public CardService(
        ICardRepository cardRepository,
        IBoardRepository boardRepository,
        IListRepository listRepository,
        IChecklistRepository checklistRepository,
        ILabelRepository labelRepository,
        ApplicationDbContext context,
        IActivityLogService activityLogService,
        ILogger<CardService> logger)
    {
        _cardRepository = cardRepository;
        _boardRepository = boardRepository;
        _listRepository = listRepository;
        _checklistRepository = checklistRepository;
        _labelRepository = labelRepository;
        _context = context;
        _activityLogService = activityLogService;
        _logger = logger;
    }

    public async Task<CardResponseDto> CreateCardAsync(Guid listId, Guid userId, CreateCardDto dto)
    {
        var list = await _listRepository.GetByIdAsync(listId);
        if (list == null)
            throw new KeyNotFoundException("List not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(list.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        var card = new Card
        {
            Id = Guid.NewGuid(),
            ListId = listId,
            BoardId = list.BoardId,
            Title = dto.Title,
            Description = dto.Description,
            Position = dto.Position,
            Status = "todo",
            DueDate = dto.DueDate,
            AssigneeId = dto.AssigneeId,
            Priority = dto.Priority ?? "medium",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _cardRepository.AddAsync(card);

        // Add labels
        if (dto.LabelIds != null && dto.LabelIds.Any())
        {
            foreach (var labelId in dto.LabelIds)
            {
                try
                {
                    await _labelRepository.AddLabelToCardAsync(card.Id, labelId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to add label {LabelId} to card {CardId}", labelId, card.Id);
                }
            }
        }

        // Log activity
        await _activityLogService.LogActivityAsync(
            list.BoardId,
            card.Id,
            userId,
            "create_card",
            $"Created card '{card.Title}'",
            new { cardTitle = card.Title, listName = list.Name }
        );

        return await GetCardByIdAsync(card.Id, userId);
    }

    public async Task<CardResponseDto> GetCardByIdAsync(Guid cardId, Guid userId, bool includeChecklist = true, bool includeComments = true, bool includeAttachments = true)
    {
        var card = await _cardRepository.GetByIdAsync(cardId);
        if (card == null)
            throw new KeyNotFoundException("Card not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(card.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        return await MapToDtoAsync(card, includeChecklist, includeComments, includeAttachments);
    }

    public async Task<CardResponseDto> UpdateCardAsync(Guid cardId, Guid userId, UpdateCardDto dto)
    {
        var card = await _cardRepository.GetByIdAsync(cardId);
        if (card == null)
            throw new KeyNotFoundException("Card not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(card.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        var changes = new List<string>();

        if (!string.IsNullOrEmpty(dto.Title) && dto.Title != card.Title)
        {
            changes.Add($"title: '{card.Title}' → '{dto.Title}'");
            card.Title = dto.Title;
        }

        if (dto.Description != null && dto.Description != card.Description)
        {
            changes.Add("description updated");
            card.Description = dto.Description;
        }

        if (!string.IsNullOrEmpty(dto.DueDate) && dto.DueDate != card.DueDate)
        {
            changes.Add($"due date: '{card.DueDate}' → '{dto.DueDate}'");
            card.DueDate = dto.DueDate;
        }

        if (dto.AssigneeId.HasValue && dto.AssigneeId != card.AssigneeId)
        {
            var oldAssignee = card.AssigneeId.HasValue ? (await _context.Users.FindAsync(card.AssigneeId))?.Name : null;
            var newAssignee = dto.AssigneeId.HasValue ? (await _context.Users.FindAsync(dto.AssigneeId))?.Name : null;
            changes.Add($"assignee: '{oldAssignee}' → '{newAssignee}'");
            card.AssigneeId = dto.AssigneeId;
        }

        if (!string.IsNullOrEmpty(dto.Priority) && dto.Priority != card.Priority)
        {
            changes.Add($"priority: '{card.Priority}' → '{dto.Priority}'");
            card.Priority = dto.Priority;
        }

        if (!string.IsNullOrEmpty(dto.Status) && dto.Status != card.Status)
        {
            changes.Add($"status: '{card.Status}' → '{dto.Status}'");
            card.Status = dto.Status;
        }

        if (dto.Position.HasValue && dto.Position != card.Position)
        {
            card.Position = dto.Position.Value;
        }

        card.UpdatedAt = DateTime.UtcNow;
        await _cardRepository.UpdateAsync(card);

        // Log activity
        if (changes.Any())
        {
            await _activityLogService.LogActivityAsync(
                card.BoardId,
                card.Id,
                userId,
                "update_card",
                $"Updated card '{card.Title}': {string.Join(", ", changes)}",
                new { changes }
            );
        }

        return await GetCardByIdAsync(cardId, userId);
    }

    public async Task DeleteCardAsync(Guid cardId, Guid userId)
    {
        var card = await _cardRepository.GetByIdAsync(cardId);
        if (card == null)
            throw new KeyNotFoundException("Card not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(card.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        await _cardRepository.DeleteAsync(card);

        // Log activity
        await _activityLogService.LogActivityAsync(
            card.BoardId,
            null,
            userId,
            "delete_card",
            $"Deleted card '{card.Title}'",
            new { cardTitle = card.Title }
        );
    }

    public async Task<CardResponseDto> MoveCardAsync(Guid cardId, Guid userId, MoveCardDto dto)
    {
        var card = await _cardRepository.GetByIdAsync(cardId);
        if (card == null)
            throw new KeyNotFoundException("Card not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(card.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        var oldList = await _listRepository.GetByIdAsync(card.ListId);
        var newList = await _listRepository.GetByIdAsync(dto.ListId);
        if (newList == null)
            throw new KeyNotFoundException("Target list not found");

        if (newList.BoardId != card.BoardId)
            throw new ArgumentException("Cannot move card to list in different board");

        await _cardRepository.MoveCardAsync(card, dto.ListId, dto.Position);

        // Log activity
        await _activityLogService.LogActivityAsync(
            card.BoardId,
            card.Id,
            userId,
            "move_card",
            $"Moved card '{card.Title}' from '{oldList?.Name}' to '{newList.Name}'",
            new { fromList = oldList?.Name, toList = newList.Name, position = dto.Position }
        );

        return await GetCardByIdAsync(cardId, userId);
    }

    public async Task<CardResponseDto> CopyCardAsync(Guid cardId, Guid userId, CopyCardDto dto)
    {
        var sourceCard = await _cardRepository.GetByIdAsync(cardId);
        if (sourceCard == null)
            throw new KeyNotFoundException("Card not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(sourceCard.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        var targetList = await _listRepository.GetByIdAsync(dto.ListId);
        if (targetList == null)
            throw new KeyNotFoundException("Target list not found");

        if (targetList.BoardId != sourceCard.BoardId)
            throw new ArgumentException("Cannot copy card to list in different board");

        // Create new card as a copy
        var newCard = new Card
        {
            Id = Guid.NewGuid(),
            ListId = dto.ListId,
            BoardId = sourceCard.BoardId,
            Title = dto.Title ?? $"{sourceCard.Title} (Copy)",
            Description = sourceCard.Description,
            Position = dto.Position,
            Status = "todo", // Reset status to todo
            DueDate = sourceCard.DueDate,
            AssigneeId = sourceCard.AssigneeId,
            Priority = sourceCard.Priority,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _cardRepository.AddAsync(newCard);

        // Copy labels
        var labels = await _labelRepository.GetCardLabelsAsync(sourceCard.Id);
        foreach (var label in labels)
        {
            try
            {
                await _labelRepository.AddLabelToCardAsync(newCard.Id, label.Id);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to add label {LabelId} to copied card {CardId}", label.Id, newCard.Id);
            }
        }

        // Log activity
        await _activityLogService.LogActivityAsync(
            newCard.BoardId,
            newCard.Id,
            userId,
            "copy_card",
            $"Copied card '{sourceCard.Title}' to '{targetList.Name}' as '{newCard.Title}'",
            new { sourceCardId = sourceCard.Id, targetList = targetList.Name }
        );

        return await GetCardByIdAsync(newCard.Id, userId);
    }

    public async Task<CardResponseDto> UpdateCardStatusAsync(Guid cardId, Guid userId, string status)
    {
        var card = await _cardRepository.GetByIdAsync(cardId);
        if (card == null)
            throw new KeyNotFoundException("Card not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(card.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        // Validate status transition
        var validStatuses = new[] { "todo", "inProgress", "waitingForApproval", "done", "rejected" };
        if (!validStatuses.Contains(status))
            throw new ArgumentException($"Invalid status: {status}");

        // Check permissions for status changes
        if (status == "waitingForApproval" && member.Role == "member")
        {
            // Members can set to waitingForApproval
        }
        else if ((status == "done" || status == "rejected") && member.Role != "leader" && member.Role != "owner")
        {
            throw new UnauthorizedAccessException("Only leaders can approve or reject cards");
        }

        var oldStatus = card.Status;
        card.Status = status;
        card.UpdatedAt = DateTime.UtcNow;
        await _cardRepository.UpdateCardStatusAsync(card, status);

        // Log activity
        await _activityLogService.LogActivityAsync(
            card.BoardId,
            card.Id,
            userId,
            "change_status",
            $"Changed card status from '{oldStatus}' to '{status}'",
            new { oldStatus, newStatus = status }
        );

        return await GetCardByIdAsync(cardId, userId);
    }

    public async Task<CardResponseDto> ApproveCardAsync(Guid cardId, Guid userId, string? comment)
    {
        var card = await _cardRepository.GetByIdAsync(cardId);
        if (card == null)
            throw new KeyNotFoundException("Card not found");

        // Check if user is leader or owner
        var member = await _boardRepository.GetBoardMemberAsync(card.BoardId, userId);
        if (member == null || (member.Role != "leader" && member.Role != "owner"))
            throw new UnauthorizedAccessException("Only leaders can approve cards");

        if (card.Status != "waitingForApproval")
            throw new InvalidOperationException("Card is not in waitingForApproval status");

        card.Status = "done";
        card.UpdatedAt = DateTime.UtcNow;
        await _cardRepository.UpdateCardStatusAsync(card, "done");

        // Log activity
        await _activityLogService.LogActivityAsync(
            card.BoardId,
            card.Id,
            userId,
            "approve",
            $"Approved card '{card.Title}'",
            new { comment }
        );

        return await GetCardByIdAsync(cardId, userId);
    }

    public async Task<CardResponseDto> RejectCardAsync(Guid cardId, Guid userId, string reason)
    {
        var card = await _cardRepository.GetByIdAsync(cardId);
        if (card == null)
            throw new KeyNotFoundException("Card not found");

        // Check if user is leader or owner
        var member = await _boardRepository.GetBoardMemberAsync(card.BoardId, userId);
        if (member == null || (member.Role != "leader" && member.Role != "owner"))
            throw new UnauthorizedAccessException("Only leaders can reject cards");

        if (card.Status != "waitingForApproval")
            throw new InvalidOperationException("Card is not in waitingForApproval status");

        card.Status = "rejected";
        card.UpdatedAt = DateTime.UtcNow;
        await _cardRepository.UpdateCardStatusAsync(card, "rejected");

        // Create auto-comment
        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            CardId = cardId,
            AuthorId = userId,
            Content = $"Rejected: {reason}",
            Mentions = "[]",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _context.Comments.AddAsync(comment);
        await _context.SaveChangesAsync();

        // Log activity
        await _activityLogService.LogActivityAsync(
            card.BoardId,
            card.Id,
            userId,
            "reject",
            $"Rejected card '{card.Title}': {reason}",
            new { reason }
        );

        return await GetCardByIdAsync(cardId, userId);
    }

    public async Task<IEnumerable<CardResponseDto>> GetListCardsAsync(Guid listId, Guid userId, string? status = null, Guid? assigneeId = null, Guid? labelId = null, string? dueDate = null)
    {
        var list = await _listRepository.GetByIdAsync(listId);
        if (list == null)
            throw new KeyNotFoundException("List not found");

        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(list.BoardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        var cards = await _cardRepository.GetListCardsAsync(listId);

        // Apply filters
        if (!string.IsNullOrEmpty(status))
            cards = cards.Where(c => c.Status == status);

        if (assigneeId.HasValue)
            cards = cards.Where(c => c.AssigneeId == assigneeId);

        if (labelId.HasValue)
            cards = cards.Where(c => c.CardLabels.Any(cl => cl.LabelId == labelId));

        if (!string.IsNullOrEmpty(dueDate))
            cards = cards.Where(c => c.DueDate == dueDate);

        var result = new List<CardResponseDto>();
        foreach (var card in cards)
        {
            result.Add(await MapToDtoAsync(card, false, false, false));
        }

        return result;
    }

    public async Task<IEnumerable<CardResponseDto>> SearchCardsAsync(Guid boardId, Guid userId, string query, string? status = null, Guid? assigneeId = null, Guid? labelId = null, string? dueDate = null, int limit = 20, int offset = 0)
    {
        // Check if user is board member
        var member = await _boardRepository.GetBoardMemberAsync(boardId, userId);
        if (member == null)
            throw new UnauthorizedAccessException("You are not a member of this board");

        var cards = await _cardRepository.SearchCardsAsync(boardId, query, status, assigneeId, labelId, dueDate);

        var result = new List<CardResponseDto>();
        foreach (var card in cards.Skip(offset).Take(limit))
        {
            result.Add(await MapToDtoAsync(card, false, false, false));
        }

        return result;
    }

    private async Task<CardResponseDto> MapToDtoAsync(Card card, bool includeChecklist, bool includeComments, bool includeAttachments)
    {
        var assignee = card.AssigneeId.HasValue ? await _context.Users.FindAsync(card.AssigneeId) : null;

        // Get labels
        var labels = await _labelRepository.GetCardLabelsAsync(card.Id);
        var labelDtos = labels.Select(l => new LabelResponseDto
        {
            Id = l.Id,
            BoardId = l.BoardId,
            Name = l.Name,
            Color = l.Color,
            CreatedAt = l.CreatedAt
        });

        // Get checklist progress
        var (total, completed, percentage) = await _checklistRepository.GetChecklistProgressAsync(card.Id);

        var commentCount = includeComments ? await _context.Comments.CountAsync(c => c.CardId == card.Id) : 0;
        var attachmentCount = includeAttachments ? await _context.Attachments.CountAsync(a => a.CardId == card.Id) : 0;

        return new CardResponseDto
        {
            Id = card.Id,
            ListId = card.ListId,
            BoardId = card.BoardId,
            Title = card.Title,
            Description = card.Description,
            Position = card.Position,
            Status = card.Status,
            DueDate = card.DueDate,
            Assignee = assignee != null ? new UserResponseDto
            {
                Id = assignee.Id,
                GoogleId = assignee.GoogleId,
                Name = assignee.Name,
                Email = assignee.Email,
                AvatarUrl = assignee.AvatarUrl,
                TelegramChatId = assignee.TelegramChatId,
                CreatedAt = assignee.CreatedAt,
                LastLoginAt = assignee.LastLoginAt,
                Role = assignee.Role
            } : null,
            Priority = card.Priority,
            Labels = labelDtos,
            ChecklistProgress = new ChecklistProgressResponseDto
            {
                Total = total,
                Completed = completed,
                Percentage = percentage
            },
            CommentCount = commentCount,
            AttachmentCount = attachmentCount,
            CreatedAt = card.CreatedAt,
            UpdatedAt = card.UpdatedAt
        };
    }
}
