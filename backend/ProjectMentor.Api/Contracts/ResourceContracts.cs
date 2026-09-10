namespace ProjectMentor.Api.Contracts;

/// <summary>Query parameters for browsing the resource catalog (search, filter, sort, paginate).</summary>
public sealed record ResourceQuery
{
    public string? Search { get; init; }
    public string? Topic { get; init; }
    public string? Type { get; init; }
    public string? Tag { get; init; }
    public string SortBy { get; init; } = "title";
    public string SortDir { get; init; } = "asc";
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public sealed record ResourceItemResponse(
    Guid Id,
    string Title,
    string Url,
    string ResourceType,
    string Topic,
    string? Description,
    IReadOnlyList<string> Tags);

public sealed record PagedResponse<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int TotalItems,
    int TotalPages);

public sealed record ResourceFacetsResponse(
    IReadOnlyList<string> Topics,
    IReadOnlyList<string> Types,
    IReadOnlyList<string> Tags);

public sealed record CreateResourceRequest(
    string Title,
    string Url,
    string ResourceType,
    string Topic,
    string? Description,
    IReadOnlyList<string>? Tags);

public sealed record UpdateResourceRequest(
    string Title,
    string Url,
    string ResourceType,
    string Topic,
    string? Description,
    IReadOnlyList<string>? Tags);
