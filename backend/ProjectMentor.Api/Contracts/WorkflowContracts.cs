namespace ProjectMentor.Api.Contracts;

public sealed record IntakeRequest(int Year, string ProjectType, DateOnly Deadline, decimal HoursPerWeek);
public sealed record CreateRoadmapRequestResponse(Guid RoadmapRequestId, string Status, Guid? RoadmapId);
public sealed record RoadmapResponse(Guid Id, string Status, string RequestStatus, IReadOnlyList<MilestoneResponse> Milestones);
public sealed record MilestoneResponse(Guid Id, string Phase, string Title, string? Description, DateOnly DueDate, string Status, IReadOnlyList<ResourceResponse> Resources);
public sealed record ResourceResponse(Guid Id, string Title, string Url, string Topic);
public sealed record ApprovalRequest(string? Comment);
