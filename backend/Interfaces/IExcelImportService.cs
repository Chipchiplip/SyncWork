using TaskManager.DTOs;

namespace TaskManager.Interfaces;

public interface IExcelImportService
{
    Task<ExcelImportResponseDto> ImportExcelAsync(Guid boardId, Guid userId, Stream fileStream, ExcelImportOptionsDto? options = null);
    Task<ExcelImportStatusDto> GetImportStatusAsync(Guid boardId, Guid importId, Guid userId);
    Task<byte[]> GetTemplateAsync(Guid boardId, Guid userId);
}

