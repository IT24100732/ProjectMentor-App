using Microsoft.EntityFrameworkCore;
using Npgsql;
using ProjectMentor.Data;

var builder = WebApplication.CreateBuilder(args);

var dataSourceBuilder = new NpgsqlDataSourceBuilder(builder.Configuration.GetConnectionString("DefaultConnection"));
dataSourceBuilder.MapEnum<UserRole>("user_role");
dataSourceBuilder.MapEnum<QuestionAnswerType>("question_answer_type");
dataSourceBuilder.MapEnum<RoadmapRequestStatus>("roadmap_request_status");
dataSourceBuilder.MapEnum<RoadmapStatus>("roadmap_status");
dataSourceBuilder.MapEnum<MilestonePhase>("milestone_phase");
dataSourceBuilder.MapEnum<MilestoneStatus>("milestone_status");
dataSourceBuilder.MapEnum<ResourceType>("resource_type");
dataSourceBuilder.MapEnum<AgentName>("agent_name");
dataSourceBuilder.MapEnum<WorkflowRunStatus>("workflow_run_status");
dataSourceBuilder.MapEnum<AgentStepStatus>("agent_step_status");
dataSourceBuilder.MapEnum<ApprovalDecisionType>("approval_decision_type");
dataSourceBuilder.MapEnum<NotificationType>("notification_type");
dataSourceBuilder.MapEnum<GuidanceTemplateType>("guidance_template_type");
var dataSource = dataSourceBuilder.Build();

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<ProjectMentorDbContext>(options =>
    options.UseNpgsql(dataSource));
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    await using var scope = app.Services.CreateAsyncScope();
    var db = scope.ServiceProvider.GetRequiredService<ProjectMentorDbContext>();
    await db.Database.MigrateAsync();
    await SeedData.InitializeAsync(db, app.Configuration);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

app.MapControllers();

app.Run();
