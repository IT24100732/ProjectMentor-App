using ProjectMentor.Api.Services;
using Xunit;

namespace ProjectMentor.Tests.Unit;

/// <summary>Unit tests for the deterministic sprint-week helpers used by the group board.</summary>
public class SprintPlannerAgentTests
{
    [Theory]
    [InlineData(2026, 1, 1)]   // Thursday
    [InlineData(2026, 3, 15)]  // Sunday
    [InlineData(2026, 6, 8)]   // Monday
    public void Monday_always_returns_a_monday_on_or_before_the_date(int y, int m, int d)
    {
        var date = new DateOnly(y, m, d);
        var monday = SprintPlannerAgent.Monday(date);

        Assert.Equal(DayOfWeek.Monday, monday.DayOfWeek);
        Assert.True(monday <= date);
        Assert.True((date.DayNumber - monday.DayNumber) < 7);
    }

    [Fact]
    public void WindowFor_returns_ascending_mondays_up_to_the_due_week()
    {
        var today = new DateOnly(2026, 1, 1);
        var due = new DateOnly(2026, 2, 1);

        var weeks = SprintPlannerAgent.WindowFor(previousDue: null, due: due, today: today);

        Assert.NotEmpty(weeks);
        Assert.All(weeks, w => Assert.Equal(DayOfWeek.Monday, w.DayOfWeek));
        Assert.Equal(SprintPlannerAgent.Monday(due), weeks[^1]);
        for (var i = 1; i < weeks.Count; i++)
            Assert.True(weeks[i] > weeks[i - 1]); // strictly increasing
    }

    [Fact]
    public void WindowFor_overdue_milestone_catches_up_this_week_only()
    {
        var today = new DateOnly(2026, 6, 1);
        var due = new DateOnly(2026, 5, 1); // already past

        var weeks = SprintPlannerAgent.WindowFor(null, due, today);

        Assert.Single(weeks);
        Assert.Equal(SprintPlannerAgent.Monday(today), weeks[0]);
    }
}
