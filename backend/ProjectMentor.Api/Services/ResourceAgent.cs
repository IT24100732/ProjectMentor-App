using Microsoft.EntityFrameworkCore;
using ProjectMentor.Data;

namespace ProjectMentor.Api.Services;

public sealed class ResourceAgent(ProjectMentorDbContext db)
{
    public async Task RunAsync(WorkflowContext context, CancellationToken cancellationToken)
    {
        var step = AgentSupport.StartStep(context.Run, AgentName.ResourceAgent, 2, new { phases = context.Plan.Select(x => x.Phase.ToString()) });
        var resources = await db.Resources.AsNoTracking().ToListAsync(cancellationToken);
        var attached = 0;

        if (context.Roadmap is not null)
        {
            foreach (var milestone in context.Roadmap.Milestones)
            {
                var matches = resources.Where(resource => resource.Topic.Contains(milestone.Phase.ToString(), StringComparison.OrdinalIgnoreCase)).Take(2).ToList();
                if (matches.Count == 0) matches = resources.Take(1).ToList();
                foreach (var resource in matches)
                {
                    db.MilestoneResources.Add(new MilestoneResource
                    {
                        Id = Guid.NewGuid(), MilestoneId = milestone.Id, ResourceId = resource.Id, AttachedBy = AgentName.ResourceAgent
                    });
                    attached++;
                }
            }
        }

        AgentSupport.AddToolCall(db, step, "resource_catalog_lookup", new { count = resources.Count }, new { attached });
        AgentSupport.CompleteStep(db, step, new { attached });
        await db.SaveChangesAsync(cancellationToken);
    }
}
