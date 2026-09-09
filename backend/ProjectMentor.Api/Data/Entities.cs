using System.Text.Json;

namespace ProjectMentor.Data;

public enum UserRole { Student, Admin }
public enum QuestionAnswerType { Choice, MultiSelect, ShortText, Number, Date }
public enum RoadmapRequestStatus { Submitted, Planning, PendingApproval, Accepted, RevisionRequested, Failed }
public enum RoadmapStatus { Draft, PendingApproval, Accepted, Superseded, Rejected }
public enum MilestonePhase { Title, Design, Build, Documentation, Presentation, Deployment }
public enum MilestoneStatus { NotStarted, InProgress, Blocked, Done }
public enum ResourceType { Video, Article, Documentation, Course }
public enum AgentName { Planner, ResourceAgent, AnalysisAgent, ValidationAgent }
public enum WorkflowRunStatus { Running, PausedForApproval, Completed, Failed }
public enum AgentStepStatus { Pending, Running, Success, Failed }
public enum ApprovalDecisionType { Accepted, RevisionRequested }
public enum NotificationType { MilestoneReminder, PlanReady, Overdue }
public enum GuidanceTemplateType { ReportOutline, PresentationSkeleton, DeploymentChecklist }

public abstract class AuditedEntity
{
    public Guid Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class User : AuditedEntity
{
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public UserRole Role { get; set; }
    public short? YearOfStudy { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<RoadmapRequest> RoadmapRequests { get; set; } = [];
    public ICollection<Roadmap> Roadmaps { get; set; } = [];
    public ICollection<MilestoneStatusHistory> MilestoneStatusChanges { get; set; } = [];
    public ICollection<Resource> ResourcesAdded { get; set; } = [];
    public ICollection<ApprovalDecision> ApprovalDecisions { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
}

public sealed class Question : AuditedEntity
{
    public string Code { get; set; } = null!;
    public string PromptText { get; set; } = null!;
    public QuestionAnswerType AnswerType { get; set; }
    public JsonDocument? Options { get; set; }
    public bool IsCore { get; set; }
    public Guid? DependsOnQuestionId { get; set; }
    public string? DependsOnValue { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public Question? DependsOnQuestion { get; set; }
    public ICollection<Question> DependentQuestions { get; set; } = [];
    public ICollection<QuestionAnswer> Answers { get; set; } = [];
}

public sealed class RoadmapRequest : AuditedEntity
{
    public Guid StudentId { get; set; }
    public RoadmapRequestStatus Status { get; set; }
    public User Student { get; set; } = null!;
    public ICollection<QuestionAnswer> Answers { get; set; } = [];
    public ICollection<Roadmap> Roadmaps { get; set; } = [];
    public ICollection<AgentWorkflowRun> WorkflowRuns { get; set; } = [];
}

public sealed class QuestionAnswer : AuditedEntity
{
    public Guid RoadmapRequestId { get; set; }
    public Guid QuestionId { get; set; }
    public JsonDocument AnswerValue { get; set; } = null!;
    public RoadmapRequest RoadmapRequest { get; set; } = null!;
    public Question Question { get; set; } = null!;
}

public sealed class Roadmap : AuditedEntity
{
    public Guid RoadmapRequestId { get; set; }
    public Guid StudentId { get; set; }
    public int Version { get; set; } = 1;
    public RoadmapStatus Status { get; set; }
    public DateTimeOffset? GeneratedAt { get; set; }
    public DateTimeOffset? AcceptedAt { get; set; }
    public RoadmapRequest RoadmapRequest { get; set; } = null!;
    public User Student { get; set; } = null!;
    public ICollection<Milestone> Milestones { get; set; } = [];
}

public sealed class Milestone : AuditedEntity
{
    public Guid RoadmapId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public MilestonePhase Phase { get; set; }
    public int OrderIndex { get; set; }
    public DateOnly DueDate { get; set; }
    public MilestoneStatus Status { get; set; }
    public decimal? EstimatedHours { get; set; }
    public Roadmap Roadmap { get; set; } = null!;
    public ICollection<MilestoneStatusHistory> StatusHistory { get; set; } = [];
    public ICollection<MilestoneResource> Resources { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
}

public sealed class MilestoneStatusHistory : AuditedEntity
{
    public Guid MilestoneId { get; set; }
    public MilestoneStatus? OldStatus { get; set; }
    public MilestoneStatus NewStatus { get; set; }
    public Guid ChangedById { get; set; }
    public DateTimeOffset ChangedAt { get; set; }
    public Milestone Milestone { get; set; } = null!;
    public User ChangedBy { get; set; } = null!;
}

public sealed class Resource : AuditedEntity
{
    public string Title { get; set; } = null!;
    public string Url { get; set; } = null!;
    public ResourceType ResourceType { get; set; }
    public string Topic { get; set; } = null!;
    public string? Description { get; set; }
    public Guid AddedById { get; set; }
    public User AddedBy { get; set; } = null!;
    public ICollection<ResourceTag> Tags { get; set; } = [];
    public ICollection<MilestoneResource> Milestones { get; set; } = [];
}

public sealed class Tag : AuditedEntity
{
    public string Name { get; set; } = null!;
    public ICollection<ResourceTag> Resources { get; set; } = [];
}

public sealed class ResourceTag : AuditedEntity
{
    public Guid ResourceId { get; set; }
    public Guid TagId { get; set; }
    public Resource Resource { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}

public sealed class MilestoneResource : AuditedEntity
{
    public Guid MilestoneId { get; set; }
    public Guid ResourceId { get; set; }
    public AgentName AttachedBy { get; set; }
    public Milestone Milestone { get; set; } = null!;
    public Resource Resource { get; set; } = null!;
}

public sealed class AgentWorkflowRun : AuditedEntity
{
    public Guid RoadmapRequestId { get; set; }
    public string Objective { get; set; } = null!;
    public WorkflowRunStatus Status { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public RoadmapRequest RoadmapRequest { get; set; } = null!;
    public ICollection<AgentStep> Steps { get; set; } = [];
    public ICollection<ValidationResult> ValidationResults { get; set; } = [];
    public ICollection<ApprovalDecision> ApprovalDecisions { get; set; } = [];
}

public sealed class AgentStep : AuditedEntity
{
    public Guid WorkflowRunId { get; set; }
    public AgentName AgentName { get; set; }
    public int StepOrder { get; set; }
    public JsonDocument InputPayload { get; set; } = null!;
    public JsonDocument? OutputPayload { get; set; }
    public AgentStepStatus Status { get; set; }
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public AgentWorkflowRun WorkflowRun { get; set; } = null!;
    public ICollection<ToolCall> ToolCalls { get; set; } = [];
}

public sealed class ToolCall : AuditedEntity
{
    public Guid AgentStepId { get; set; }
    public string ToolName { get; set; } = null!;
    public JsonDocument InputParams { get; set; } = null!;
    public JsonDocument? OutputResult { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public int? DurationMs { get; set; }
    public DateTimeOffset CalledAt { get; set; }
    public AgentStep AgentStep { get; set; } = null!;
}

public sealed class ValidationResult : AuditedEntity
{
    public Guid WorkflowRunId { get; set; }
    public string RuleName { get; set; } = null!;
    public bool Passed { get; set; }
    public string? Details { get; set; }
    public DateTimeOffset CheckedAt { get; set; }
    public AgentWorkflowRun WorkflowRun { get; set; } = null!;
}

public sealed class ApprovalDecision : AuditedEntity
{
    public Guid WorkflowRunId { get; set; }
    public Guid StudentId { get; set; }
    public ApprovalDecisionType Decision { get; set; }
    public string? Comment { get; set; }
    public DateTimeOffset DecidedAt { get; set; }
    public AgentWorkflowRun WorkflowRun { get; set; } = null!;
    public User Student { get; set; } = null!;
}

public sealed class Notification : AuditedEntity
{
    public Guid UserId { get; set; }
    public NotificationType NotificationType { get; set; }
    public string Message { get; set; } = null!;
    public Guid? RelatedMilestoneId { get; set; }
    public bool IsRead { get; set; }
    public User User { get; set; } = null!;
    public Milestone? RelatedMilestone { get; set; }
}

public sealed class GuidanceTemplate : AuditedEntity
{
    public GuidanceTemplateType TemplateType { get; set; }
    public string Name { get; set; } = null!;
    public string[] ApplicableProjectTypes { get; set; } = [];
    public JsonDocument Content { get; set; } = null!;
}
