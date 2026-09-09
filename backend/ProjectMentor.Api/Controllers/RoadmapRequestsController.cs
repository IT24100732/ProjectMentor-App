using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectMentor.Api.Contracts;
using ProjectMentor.Api.Services;

namespace ProjectMentor.Api.Controllers;

[ApiController]
[Authorize(Roles = "Student")]
[Route("api/roadmap-requests")]
public sealed class RoadmapRequestsController(WorkflowService workflow) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<CreateRoadmapRequestResponse>> Create(IntakeRequest intake, CancellationToken cancellationToken)
    {
        try
        {
            var request = await workflow.CreateAsync(User.GetUserId(), intake, cancellationToken);
            var roadmap = request.Roadmaps.SingleOrDefault();
            return Ok(new CreateRoadmapRequestResponse(request.Id, request.Status.ToString(), roadmap?.Id));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            return UnprocessableEntity(exception.Message);
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RoadmapResponse>> Get(Guid id, CancellationToken cancellationToken)
    {
        var request = await workflow.GetAsync(User.GetUserId(), id, cancellationToken);
        if (request is null) return NotFound();
        var roadmap = request.Roadmaps.OrderByDescending(x => x.Version).FirstOrDefault();
        return Ok(roadmap is null
            ? new RoadmapResponse(Guid.Empty, "None", request.Status.ToString(), [])
            : RoadmapMapper.Map(request, roadmap));
    }
}

internal static class RoadmapMapper
{
    public static RoadmapResponse Map(ProjectMentor.Data.RoadmapRequest request, ProjectMentor.Data.Roadmap roadmap) =>
        new(roadmap.Id, roadmap.Status.ToString(), request.Status.ToString(), roadmap.Milestones.OrderBy(x => x.OrderIndex).Select(m =>
            new MilestoneResponse(m.Id, m.Phase.ToString(), m.Title, m.Description, m.DueDate, m.Status.ToString(),
                m.Resources.Select(link => new ResourceResponse(link.Resource.Id, link.Resource.Title, link.Resource.Url, link.Resource.Topic)).ToList())).ToList());
}
