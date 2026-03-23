using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication2.Data;
using WebApplication2.Models;

[ApiController]
[Route("[controller]")]
public class SessionController : ControllerBase
{
    private readonly MyDbContext _context;

    public SessionController(MyDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IEnumerable<Session>> GetAll()
    {
        return await _context.Sessions.ToListAsync();
    }

    [HttpPost]
    public async Task<IActionResult> Create(Session session)
    {
        _context.Sessions.Add(session);
        await _context.SaveChangesAsync();
        
        // Once again, don't really know what this does.
        return CreatedAtAction(nameof(GetAll), new { id = session.Id }, session);
    }
}
