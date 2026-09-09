namespace ProjectMentor.Api.Contracts;

public sealed record RegisterRequest(string Email, string Password, string FullName, short? YearOfStudy);
public sealed record LoginRequest(string Email, string Password);
public sealed record AuthResponse(Guid UserId, string Email, string FullName, string Role, string Token);
public sealed record CurrentUserResponse(Guid UserId, string Email, string FullName, string Role);
