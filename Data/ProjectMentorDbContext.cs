using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Text.Json;

namespace ProjectMentor.Data;

public sealed class ProjectMentorDbContext(DbContextOptions<ProjectMentorDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<RoadmapRequest> RoadmapRequests => Set<RoadmapRequest>();
    public DbSet<QuestionAnswer> QuestionAnswers => Set<QuestionAnswer>();
    public DbSet<Roadmap> Roadmaps => Set<Roadmap>();
    public DbSet<Milestone> Milestones => Set<Milestone>();
    public DbSet<MilestoneStatusHistory> MilestoneStatusHistory => Set<MilestoneStatusHistory>();
    public DbSet<Resource> Resources => Set<Resource>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ResourceTag> ResourceTags => Set<ResourceTag>();
    public DbSet<MilestoneResource> MilestoneResources => Set<MilestoneResource>();
    public DbSet<AgentWorkflowRun> AgentWorkflowRuns => Set<AgentWorkflowRun>();
    public DbSet<AgentStep> AgentSteps => Set<AgentStep>();
    public DbSet<ToolCall> ToolCalls => Set<ToolCall>();
    public DbSet<ValidationResult> ValidationResults => Set<ValidationResult>();
    public DbSet<ApprovalDecision> ApprovalDecisions => Set<ApprovalDecision>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<GuidanceTemplate> GuidanceTemplates => Set<GuidanceTemplate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasPostgresExtension("pgcrypto");
        modelBuilder.HasDefaultSchema("public");
        modelBuilder.HasPostgresEnum<UserRole>(name: "user_role");
        modelBuilder.HasPostgresEnum<QuestionAnswerType>(name: "question_answer_type");
        modelBuilder.HasPostgresEnum<RoadmapRequestStatus>(name: "roadmap_request_status");
        modelBuilder.HasPostgresEnum<RoadmapStatus>(name: "roadmap_status");
        modelBuilder.HasPostgresEnum<MilestonePhase>(name: "milestone_phase");
        modelBuilder.HasPostgresEnum<MilestoneStatus>(name: "milestone_status");
        modelBuilder.HasPostgresEnum<ResourceType>(name: "resource_type");
        modelBuilder.HasPostgresEnum<AgentName>(name: "agent_name");
        modelBuilder.HasPostgresEnum<WorkflowRunStatus>(name: "workflow_run_status");
        modelBuilder.HasPostgresEnum<AgentStepStatus>(name: "agent_step_status");
        modelBuilder.HasPostgresEnum<ApprovalDecisionType>(name: "approval_decision_type");
        modelBuilder.HasPostgresEnum<NotificationType>(name: "notification_type");
        modelBuilder.HasPostgresEnum<GuidanceTemplateType>(name: "guidance_template_type");

        foreach (var entity in modelBuilder.Model.GetEntityTypes().Where(e => typeof(AuditedEntity).IsAssignableFrom(e.ClrType)))
        {
            modelBuilder.Entity(entity.ClrType).Property<Guid>(nameof(AuditedEntity.Id)).HasDefaultValueSql("gen_random_uuid()");
            modelBuilder.Entity(entity.ClrType).Property<DateTimeOffset>(nameof(AuditedEntity.CreatedAt)).HasDefaultValueSql("now()");
            modelBuilder.Entity(entity.ClrType).Property<DateTimeOffset>(nameof(AuditedEntity.UpdatedAt)).HasDefaultValueSql("now()");
        }

        ConfigureUsers(modelBuilder);
        ConfigureQuestions(modelBuilder);
        ConfigurePlanning(modelBuilder);
        ConfigureResources(modelBuilder);
        ConfigureWorkflow(modelBuilder);
        ConfigureProgressAndGuidance(modelBuilder);
    }

    private static void ConfigureUsers(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<User>();
        entity.ToTable("users");
        entity.HasIndex(x => x.Email).IsUnique();
        entity.Property(x => x.Email).HasMaxLength(320).IsRequired()
            .HasConversion(new ValueConverter<string, string>(value => value.ToLowerInvariant(), value => value));
        entity.Property(x => x.PasswordHash).IsRequired();
        entity.Property(x => x.FullName).HasMaxLength(200).IsRequired();
        entity.Property(x => x.Role).HasColumnType("user_role");
        entity.HasIndex(x => x.Email).HasDatabaseName("ix_users_email_lower").IsUnique().HasFilter(null);
    }

    private static void ConfigureQuestions(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Question>();
        entity.ToTable("questions");
        entity.HasIndex(x => x.Code).IsUnique();
        entity.Property(x => x.Code).HasMaxLength(100).IsRequired();
        entity.Property(x => x.PromptText).IsRequired();
        entity.Property(x => x.AnswerType).HasColumnType("question_answer_type");
        entity.Property(x => x.Options).HasColumnType("jsonb");
        entity.HasOne(x => x.DependsOnQuestion).WithMany(x => x.DependentQuestions).HasForeignKey(x => x.DependsOnQuestionId).OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigurePlanning(ModelBuilder modelBuilder)
    {
        var request = modelBuilder.Entity<RoadmapRequest>();
        request.ToTable("roadmap_requests");
        request.Property(x => x.Status).HasColumnType("roadmap_request_status");
        request.HasIndex(x => new { x.StudentId, x.Status });
        request.HasOne(x => x.Student).WithMany(x => x.RoadmapRequests).HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Restrict);

        var answer = modelBuilder.Entity<QuestionAnswer>();
        answer.ToTable("question_answers");
        answer.Property(x => x.AnswerValue).HasColumnType("jsonb");
        answer.HasIndex(x => x.RoadmapRequestId);
        answer.HasIndex(x => new { x.RoadmapRequestId, x.QuestionId }).IsUnique();
        answer.HasOne(x => x.RoadmapRequest).WithMany(x => x.Answers).HasForeignKey(x => x.RoadmapRequestId).OnDelete(DeleteBehavior.Cascade);
        answer.HasOne(x => x.Question).WithMany(x => x.Answers).HasForeignKey(x => x.QuestionId).OnDelete(DeleteBehavior.Restrict);

        var roadmap = modelBuilder.Entity<Roadmap>();
        roadmap.ToTable("roadmaps");
        roadmap.Property(x => x.Status).HasColumnType("roadmap_status");
        roadmap.HasOne(x => x.RoadmapRequest).WithMany(x => x.Roadmaps).HasForeignKey(x => x.RoadmapRequestId).OnDelete(DeleteBehavior.Restrict);
        roadmap.HasOne(x => x.Student).WithMany(x => x.Roadmaps).HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Restrict);

        var milestone = modelBuilder.Entity<Milestone>();
        milestone.ToTable("milestones");
        milestone.Property(x => x.Phase).HasColumnType("milestone_phase");
        milestone.Property(x => x.Status).HasColumnType("milestone_status");
        milestone.Property(x => x.EstimatedHours).HasPrecision(5, 2);
        milestone.HasIndex(x => new { x.RoadmapId, x.Status });
        milestone.HasIndex(x => x.DueDate);
        milestone.HasOne(x => x.Roadmap).WithMany(x => x.Milestones).HasForeignKey(x => x.RoadmapId).OnDelete(DeleteBehavior.Cascade);

        var history = modelBuilder.Entity<MilestoneStatusHistory>();
        history.ToTable("milestone_status_history");
        history.Property(x => x.OldStatus).HasColumnType("milestone_status");
        history.Property(x => x.NewStatus).HasColumnType("milestone_status");
        history.HasOne(x => x.Milestone).WithMany(x => x.StatusHistory).HasForeignKey(x => x.MilestoneId).OnDelete(DeleteBehavior.Cascade);
        history.HasOne(x => x.ChangedBy).WithMany(x => x.MilestoneStatusChanges).HasForeignKey(x => x.ChangedById).OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureResources(ModelBuilder modelBuilder)
    {
        var resource = modelBuilder.Entity<Resource>();
        resource.ToTable("resources");
        resource.Property(x => x.ResourceType).HasColumnType("resource_type");
        resource.HasOne(x => x.AddedBy).WithMany(x => x.ResourcesAdded).HasForeignKey(x => x.AddedById).OnDelete(DeleteBehavior.Restrict);

        var tag = modelBuilder.Entity<Tag>();
        tag.ToTable("tags");
        tag.HasIndex(x => x.Name).IsUnique();
        tag.Property(x => x.Name).HasMaxLength(100).IsRequired();

        var resourceTag = modelBuilder.Entity<ResourceTag>();
        resourceTag.ToTable("resource_tags");
        resourceTag.HasIndex(x => x.TagId);
        resourceTag.HasIndex(x => new { x.ResourceId, x.TagId }).IsUnique();
        resourceTag.HasOne(x => x.Resource).WithMany(x => x.Tags).HasForeignKey(x => x.ResourceId).OnDelete(DeleteBehavior.Cascade);
        resourceTag.HasOne(x => x.Tag).WithMany(x => x.Resources).HasForeignKey(x => x.TagId).OnDelete(DeleteBehavior.Cascade);

        var milestoneResource = modelBuilder.Entity<MilestoneResource>();
        milestoneResource.ToTable("milestone_resources");
        milestoneResource.Property(x => x.AttachedBy).HasColumnType("agent_name");
        milestoneResource.HasIndex(x => new { x.MilestoneId, x.ResourceId }).IsUnique();
        milestoneResource.HasOne(x => x.Milestone).WithMany(x => x.Resources).HasForeignKey(x => x.MilestoneId).OnDelete(DeleteBehavior.Cascade);
        milestoneResource.HasOne(x => x.Resource).WithMany(x => x.Milestones).HasForeignKey(x => x.ResourceId).OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureWorkflow(ModelBuilder modelBuilder)
    {
        var run = modelBuilder.Entity<AgentWorkflowRun>();
        run.ToTable("agent_workflow_runs");
        run.Property(x => x.Status).HasColumnType("workflow_run_status");
        run.HasIndex(x => x.Status);
        run.HasOne(x => x.RoadmapRequest).WithMany(x => x.WorkflowRuns).HasForeignKey(x => x.RoadmapRequestId).OnDelete(DeleteBehavior.Restrict);

        var step = modelBuilder.Entity<AgentStep>();
        step.ToTable("agent_steps");
        step.Property(x => x.AgentName).HasColumnType("agent_name");
        step.Property(x => x.Status).HasColumnType("agent_step_status");
        step.Property(x => x.InputPayload).HasColumnType("jsonb");
        step.Property(x => x.OutputPayload).HasColumnType("jsonb");
        step.HasIndex(x => new { x.WorkflowRunId, x.StepOrder });
        step.HasOne(x => x.WorkflowRun).WithMany(x => x.Steps).HasForeignKey(x => x.WorkflowRunId).OnDelete(DeleteBehavior.Cascade);

        var call = modelBuilder.Entity<ToolCall>();
        call.ToTable("tool_calls");
        call.Property(x => x.InputParams).HasColumnType("jsonb");
        call.Property(x => x.OutputResult).HasColumnType("jsonb");
        call.HasIndex(x => x.AgentStepId);
        call.HasOne(x => x.AgentStep).WithMany(x => x.ToolCalls).HasForeignKey(x => x.AgentStepId).OnDelete(DeleteBehavior.Cascade);

        var validation = modelBuilder.Entity<ValidationResult>();
        validation.ToTable("validation_results");
        validation.HasOne(x => x.WorkflowRun).WithMany(x => x.ValidationResults).HasForeignKey(x => x.WorkflowRunId).OnDelete(DeleteBehavior.Cascade);

        var approval = modelBuilder.Entity<ApprovalDecision>();
        approval.ToTable("approval_decisions");
        approval.Property(x => x.Decision).HasColumnType("approval_decision_type");
        approval.HasOne(x => x.WorkflowRun).WithMany(x => x.ApprovalDecisions).HasForeignKey(x => x.WorkflowRunId).OnDelete(DeleteBehavior.Restrict);
        approval.HasOne(x => x.Student).WithMany(x => x.ApprovalDecisions).HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureProgressAndGuidance(ModelBuilder modelBuilder)
    {
        var notification = modelBuilder.Entity<Notification>();
        notification.ToTable("notifications");
        notification.Property(x => x.NotificationType).HasColumnType("notification_type");
        notification.HasIndex(x => new { x.UserId, x.IsRead });
        notification.HasOne(x => x.User).WithMany(x => x.Notifications).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        notification.HasOne(x => x.RelatedMilestone).WithMany(x => x.Notifications).HasForeignKey(x => x.RelatedMilestoneId).OnDelete(DeleteBehavior.SetNull);

        var template = modelBuilder.Entity<GuidanceTemplate>();
        template.ToTable("guidance_templates");
        template.Property(x => x.TemplateType).HasColumnType("guidance_template_type");
        template.Property(x => x.ApplicableProjectTypes).HasColumnType("text[]");
        template.Property(x => x.Content).HasColumnType("jsonb");
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ApplyAuditTimestamps();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        ApplyAuditTimestamps();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void ApplyAuditTimestamps()
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var entry in ChangeTracker.Entries<AuditedEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
                entry.Property(x => x.CreatedAt).IsModified = false;
            }
        }
    }
}
