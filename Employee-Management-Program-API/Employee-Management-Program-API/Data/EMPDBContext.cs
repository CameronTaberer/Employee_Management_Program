using Employee_Management_Program_API.Models;
using Microsoft.EntityFrameworkCore;

namespace Employee_Management_Program_API.Data
{
    public class EMPDBContext : DbContext
    {
        public EMPDBContext(DbContextOptions<EMPDBContext> options) : base(options)
        {
        }

        public DbSet<Employee> Employee { get; set; }
        public DbSet<Position> Position { get; set; }
    }
}