using ProjectMentor.Api.Contracts;
using ProjectMentor.Data;

namespace ProjectMentor.Api.Services;

public sealed class PlannerAgent(ProjectMentorDbContext db)
{
    public async Task RunAsync(WorkflowContext context, CancellationToken cancellationToken)
    {
        var step = AgentSupport.StartStep(context.Run, AgentName.Planner, 1, context.Intake);
        var phases = new[] { MilestonePhase.Title, MilestonePhase.Design, MilestonePhase.Build, MilestonePhase.Documentation, MilestonePhase.Presentation, MilestonePhase.Deployment };
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var totalDays = Math.Max(6, context.Intake.Deadline.DayNumber - today.DayNumber);

        for (var index = 0; index < phases.Length; index++)
        {
            var phase = phases[index];
            var dueDate = today.AddDays(Math.Max(1, (totalDays * (index + 1) / phases.Length) - 1));
            context.Plan.Add(new PlannedMilestone(phase, $"{phase} project milestone", $"Complete the {phase} phase for the project.", dueDate, Math.Max(1, context.Intake.HoursPerWeek)));
        }

        AgentSupport.AddToolCall(db, step, "deadline_calculator", new { context.Intake.Deadline, context.Intake.HoursPerWeek }, new { totalDays, milestoneCount = context.Plan.Count });
        AgentSupport.CompleteStep(db, step, context.Plan);
        await db.SaveChangesAsync(cancellationToken);
    }
}
