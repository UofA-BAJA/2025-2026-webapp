using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication2.Data;
using WebApplication2.Models;


// [AllowAnonymous]
[ApiController]
[Route("[controller]")]
public class VehicleController : ControllerBase
{
    private readonly MyDbContext _context;

    public VehicleController(MyDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IEnumerable<Vehicle>> GetAll()
    {
        return await _context.Vehicles.ToListAsync();
    }

    [HttpPost]
    public async Task<IActionResult> Create(Vehicle vehicle)
    {
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();
        // send back belt name? Idk what this function does actually...
        return CreatedAtAction(nameof(GetAll), new { name = vehicle.Name }, vehicle);
    }
}
