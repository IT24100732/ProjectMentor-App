using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using ProjectMentor.Api.Services;
using ProjectMentor.Data;

var builder = WebApplication.CreateBuilder(args);

var jwtSecret = builder.Configuration["JWT_SECRET"]
    ?? Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? "ProjectMentor-development-secret-change-before-production-1234567890";

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
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<WorkflowService>();
builder.Services.AddScoped<PlannerAgent>();
builder.Services.AddScoped<ResourceAgent>();
builder.Services.AddScoped<AnalysisAgent>();
builder.Services.AddScoped<ValidationAgent>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddCors(options => options.AddPolicy("web", policy =>
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
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

app.UseCors("web");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
