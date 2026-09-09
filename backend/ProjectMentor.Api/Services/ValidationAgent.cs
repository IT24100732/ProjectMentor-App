using ProjectMentor.Data;

namespace ProjectMentor.Api.Services;

public sealed class ValidationAgent(ProjectMentorDbContext db)
{
    public async Task RunAsync(WorkflowContext context, CancellationToken cancellationToken)
    {
        var step = AgentSupport.StartStep(context.Run, AgentName.ValidationAgent, 4, new { milestoneCount = context.Plan.Count });
        var rules = new[]
        {
            ("required_phases", Enum.GetValues<MilestonePhase>().All(phase => context.Plan.Any(item => item.Phase == phase)), "All required phases are present."),
            ("valid_dates", context.Plan.All(item => item.DueDate > DateOnly.FromDateTime(DateTime.UtcNow) && item.DueDate < context.Intake.Deadline), "Milestone dates are within the intake window."),
            ("expected_shape", context.Plan.Count == 6 && context.Plan.All(item => !string.IsNullOrWhiteSpace(item.Title)), "The plan has the expected structured shape.")
        };

        foreach (var rule in rules)
        {
            db.ValidationResults.Add(new ValidationResult
            {
                Id = Guid.NewGuid(), WorkflowRunId = context.Run.Id, RuleName = rule.Item1,
                Passed = rule.Item2, Details = rule.Item3, CheckedAt = DateTimeOffset.UtcNow
            });
            if (!rule.Item2) context.ValidationErrors.Add(rule.Item1);
        }

        context.ValidationPassed = rules.All(rule => rule.Item2) && context.AnalysisPassed;
        AgentSupport.AddToolCall(db, step, "deterministic_validator", new { rules = rules.Select(rule => rule.Item1) }, new { passed = context.ValidationPassed });
        AgentSupport.CompleteStep(db, step, new { passed = context.ValidationPassed, errors = context.ValidationErrors });
        await db.SaveChangesAsync(cancellationToken);
    }
}
