using Microsoft.EntityFrameworkCore;
using WebApplication2.Models;

namespace WebApplication2.Data;

public class MyDbContext(DbContextOptions<MyDbContext> options) : DbContext(options)
{
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Sensor> Sensors => Set<Sensor>();
    public DbSet<Log> Logs => Set<Log>();
    public DbSet<Imu> Imus => Set<Imu>();
    public DbSet<Gps> GpsReadings => Set<Gps>();
    public DbSet<Pressure> Pressures => Set<Pressure>();
    public DbSet<LinearActuator> LinearActuators => Set<LinearActuator>();
    public DbSet<Temperature> Temperatures => Set<Temperature>();
    public DbSet<Tachometer> Tachometers => Set<Tachometer>();
    public DbSet<VehicleState> VehicleStates => Set<VehicleState>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Composite PKs (Fluent API — data annotations can't express these)
        modelBuilder.Entity<Imu>()
            .HasKey(e => new { e.SessionId, e.Ts, e.Sensor });

        modelBuilder.Entity<Gps>()
            .HasKey(e => new { e.SessionId, e.Ts, e.Sensor });

        modelBuilder.Entity<Pressure>()
            .HasKey(e => new { e.SessionId, e.Ts, e.Sensor });

        modelBuilder.Entity<LinearActuator>()
            .HasKey(e => new { e.SessionId, e.Ts, e.Sensor });

        modelBuilder.Entity<Temperature>()
            .HasKey(e => new { e.SessionId, e.Ts, e.Sensor });

        modelBuilder.Entity<Tachometer>()
            .HasKey(e => new { e.SessionId, e.Ts, e.Sensor });

        modelBuilder.Entity<VehicleState>()
            .HasKey(e => new { e.SessionId, e.Ts });
    }
}