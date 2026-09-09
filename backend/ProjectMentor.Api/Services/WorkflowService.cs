using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ProjectMentor.Api.Contracts;
using ProjectMentor.Data;

namespace ProjectMentor.Api.Services;

public sealed class WorkflowService(
    ProjectMentorDbContext db,
    PlannerAgent planner,
    ResourceAgent resourceAgent,
    AnalysisAgent analysisAgent,
    ValidationAgent validationAgent)
{
    private static readonly IReadOnlyDictionary<string, Guid> QuestionIds = new Dictionary<string, Guid>
    {
        ["year_of_study"] = Guid.Parse("20000000-0000-0000-0000-000000000001"),
        ["project_type"] = Guid.Parse("20000000-0000-0000-0000-000000000003"),
        ["deadline"] = Guid.Parse("20000000-0000-0000-0000-000000000004"),
        ["hours_per_week"] = Guid.Parse("20000000-0000-0000-0000-000000000005")
    };

    public async Task<RoadmapRequest> CreateAsync(Guid studentId, IntakeRequest intake, CancellationToken cancellationToken)
    {
        if (intake.Deadline <= DateOnly.FromDateTime(DateTime.UtcNow))
            throw new ArgumentException("Deadline must be in the future.");
        if (intake.Year is < 1 or > 4 || string.IsNullOrWhiteSpace(intake.ProjectType) || intake.HoursPerWeek <= 0)
            throw new ArgumentException("Year, project type, and hours per week are invalid.");

        var now = DateTimeOffset.UtcNow;
        var request = new RoadmapRequest { Id = Guid.NewGuid(), StudentId = studentId, Status = RoadmapRequestStatus.Planning };
        db.RoadmapRequests.Add(request);
        db.QuestionAnswers.AddRange(
            Answer(request.Id, QuestionIds["year_of_study"], intake.Year),
            Answer(request.Id, QuestionIds["project_type"], intake.ProjectType),
            Answer(request.Id, QuestionIds["deadline"], intake.Deadline),
            Answer(request.Id, QuestionIds["hours_per_week"], intake.HoursPerWeek));

        var run = new AgentWorkflowRun
        {
            Id = Guid.NewGuid(), RoadmapRequestId = request.Id, Objective = "Generate and validate a student project roadmap.",
            Status = WorkflowRunStatus.Running, StartedAt = now
        };
        db.AgentWorkflowRuns.Add(run);
        await db.SaveChangesAsync(cancellationToken);

        var context = new WorkflowContext { Run = run, Request = request, Intake = intake };
        try
        {
            await planner.RunAsync(context, cancellationToken);
            context.Roadmap = new Roadmap
            {
                Id = Guid.NewGuid(), RoadmapRequestId = request.Id, StudentId = studentId, Version = 1,
                Status = RoadmapStatus.PendingApproval, GeneratedAt = DateTimeOffset.UtcNow,
                Milestones = context.Plan.Select((item, index) => new Milestone
                {
                    Id = Guid.NewGuid(), Phase = item.Phase, Title = item.Title, Description = item.Description,
                    OrderIndex = index + 1, DueDate = item.DueDate, Status = MilestoneStatus.NotStarted,
                    EstimatedHours = item.EstimatedHours
                }).ToList()
            };
            request.Roadmaps.Add(context.Roadmap);
            db.Roadmaps.Add(context.Roadmap);
            request.Status = RoadmapRequestStatus.PendingApproval;
            await db.SaveChangesAsync(cancellationToken);

            await resourceAgent.RunAsync(context, cancellationToken);
            await analysisAgent.RunAsync(context, cancellationToken);
            await validationAgent.RunAsync(context, cancellationToken);

            if (!context.ValidationPassed)
            {
                request.Status = RoadmapRequestStatus.Failed;
                run.Status = WorkflowRunStatus.Failed;
                run.CompletedAt = DateTimeOffset.UtcNow;
                context.Roadmap.Status = RoadmapStatus.Rejected;
                await db.SaveChangesAsync(cancellationToken);
                throw new InvalidOperationException($"Workflow validation failed: {string.Join(", ", context.ValidationErrors)}");
            }

            run.Status = WorkflowRunStatus.PausedForApproval;
            run.CompletedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
            return request;
        }
        catch
        {
            if (run.Status != WorkflowRunStatus.Failed)
            {
                run.Status = WorkflowRunStatus.Failed;
                run.CompletedAt = DateTimeOffset.UtcNow;
                request.Status = RoadmapRequestStatus.Failed;
                await db.SaveChangesAsync(cancellationToken);
            }
            throw;
        }
    }

    public async Task<RoadmapRequest?> GetAsync(Guid studentId, Guid requestId, CancellationToken cancellationToken) =>
        await db.RoadmapRequests.AsSplitQuery()
            .Include(x => x.Roadmaps).ThenInclude(x => x.Milestones).ThenInclude(x => x.Resources).ThenInclude(x => x.Resource)
            .Include(x => x.WorkflowRuns)
            .SingleOrDefaultAsync(x => x.Id == requestId && x.StudentId == studentId, cancellationToken);

    public async Task<RoadmapRequest?> GetLatestAsync(Guid studentId, CancellationToken cancellationToken) =>
        await db.RoadmapRequests.AsSplitQuery()
            .Include(x => x.Roadmaps).ThenInclude(x => x.Milestones).ThenInclude(x => x.Resources).ThenInclude(x => x.Resource)
            .Include(x => x.WorkflowRuns)
            .Where(x => x.StudentId == studentId)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

    private static QuestionAnswer Answer<T>(Guid requestId, Guid questionId, T value) => new()
    {
        Id = Guid.NewGuid(), RoadmapRequestId = requestId, QuestionId = questionId,
        AnswerValue = JsonDocument.Parse(JsonSerializer.Serialize(value))
    };
}
