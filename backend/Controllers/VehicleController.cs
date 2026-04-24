// VehicleController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication2.Data;
using WebApplication2.Models;

namespace WebApplication2.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehicleController : ControllerBase
{
    private readonly MyDbContext _context;
    private readonly ILogger<VehicleController> _logger;

    public VehicleController(MyDbContext context, ILogger<VehicleController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// GET: api/vehicle
    /// Retrieve all vehicles
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<Vehicle>>> GetAll()
    {
        try
        {
            var vehicles = await _context.Vehicles.ToListAsync();
            return Ok(vehicles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving vehicles");
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Error retrieving vehicles" });
        }
    }

    /// <summary>
    /// GET: api/vehicle/{name}
    /// Retrieve a specific vehicle by name
    /// </summary>
    [HttpGet("{name}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Vehicle>> GetByName(string name)
    {
        try
        {
            var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Name == name);

            if (vehicle == null)
            {
                return NotFound(new { message = $"Vehicle '{name}' not found" });
            }

            return Ok(vehicle);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving vehicle {Name}", name);
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Error retrieving vehicle" });
        }
    }

    /// <summary>
    /// POST: api/vehicle
    /// Create a new vehicle
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<Vehicle>> Create(Vehicle vehicle)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(vehicle.Name))
        {
            return BadRequest(new { message = "Vehicle name is required" });
        }

        if (vehicle.CompetitionYear < 2000 || vehicle.CompetitionYear > DateTime.Now.Year + 1)
        {
            return BadRequest(new { message = "Invalid competition year" });
        }

        try
        {
            // Check if vehicle already exists
            var existingVehicle = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.Name == vehicle.Name);

            if (existingVehicle != null)
            {
                return Conflict(new { message = $"Vehicle '{vehicle.Name}' already exists" });
            }

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByName),
                new { name = vehicle.Name }, vehicle);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error while creating vehicle");
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Error creating vehicle" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while creating vehicle");
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Unexpected error" });
        }
    }
}