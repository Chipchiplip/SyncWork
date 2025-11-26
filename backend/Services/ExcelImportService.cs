using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Services;

public class ExcelImportService : IExcelImportService
{
    private readonly ILogger<ExcelImportService> _logger;

    public ExcelImportService(ILogger<ExcelImportService> logger)
    {
        _logger = logger;
    }

    public Task<ExcelImportResponseDto> ImportExcelAsync(Guid boardId, Guid userId, Stream fileStream, ExcelImportOptionsDto? options = null)
    {
        // TODO: Implement Excel import using EPPlus
        throw new NotImplementedException();
    }

    public Task<ExcelImportStatusDto> GetImportStatusAsync(Guid boardId, Guid importId, Guid userId)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public Task<byte[]> GetTemplateAsync(Guid boardId, Guid userId)
    {
        // TODO: Implement template generation using EPPlus
        throw new NotImplementedException();
    }
}

