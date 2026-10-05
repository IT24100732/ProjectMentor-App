using ProjectMentor.Api.Controllers;
using Xunit;

namespace ProjectMentor.Tests.Unit;

/// <summary>Unit tests for the server-side password rules enforced on register, Google register and reset.</summary>
public class AuthValidationTests
{
    [Theory]
    [InlineData("abcdef12")]
    [InlineData("Password1")]
    [InlineData("roadmap2026")]
    public void Strong_passwords_are_accepted(string password) =>
        Assert.Null(AuthController.PasswordProblem(password));

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("abc12")]        // too short
    [InlineData("password")]     // no digit
    [InlineData("12345678")]     // no letter
    public void Weak_passwords_are_rejected(string? password) =>
        Assert.NotNull(AuthController.PasswordProblem(password));

    [Fact]
    public void Overly_long_passwords_are_rejected()
    {
        var tooLong = new string('a', 100) + new string('1', 30); // 130 chars
        Assert.NotNull(AuthController.PasswordProblem(tooLong));
    }
}
