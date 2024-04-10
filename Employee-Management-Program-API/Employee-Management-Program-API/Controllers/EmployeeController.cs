using Employee_Management_Program_API.Data;
using Employee_Management_Program_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace Employee_Management_Program_API.Controllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class EmployeeController : ControllerBase
    {
        private readonly EMPDBContext eMPDBContext;

        public EmployeeController(EMPDBContext emPDBContext)
        {
            eMPDBContext = emPDBContext;
        }

        [HttpGet]
        [Route("ReadAllEmployees")]
        public async Task<IActionResult> ReadAllEmployees()
        {
            try
            {
                var employees = await eMPDBContext.Employee
                    .Include(e => e.Position)
                    .ToListAsync();

                return Ok(employees);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal Server Error. Please contact support.");
            }
        }

        [HttpPost]
        [Route("AddEmployee")]
        public async Task<IActionResult> AddEmployee(EmployeeViewModel employeeViewModel)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var employee = new Employee
                {
                    Employee_Name = employeeViewModel.Employee_Name,
                    Employee_Surname = employeeViewModel.Employee_Surname,
                    Employee_Email = employeeViewModel.Employee_Email,
                    GravatarUrl = GravatarHelper.GetGravatarUrl(employeeViewModel.Employee_Email),
                    Birth_Date = employeeViewModel.Birth_Date,
                    Salary = employeeViewModel.Salary,
                    Position_ID = employeeViewModel.Position_ID,
                    Manager_ID = employeeViewModel.Manager_ID
                };

                eMPDBContext.Add(employee);

                await eMPDBContext.SaveChangesAsync();

                return Ok(employee);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal Server Error. Please contact support.");
            }
        }

        [HttpGet]
        [Route("ReadOneEmployee/{employeeID}")]
        public async Task<IActionResult> ReadOneEmployee(int employeeID)
        {
            try
            {
                var employee = await eMPDBContext.Employee
                    .Where(e => e.Employee_ID == employeeID)
                    .Include(p => p.Position)
                    .FirstAsync();

                return Ok(employee);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal Server Error. Please contact support.");
            }
        }

        [HttpPost]
        [Route("UpdateEmployee")]
        public async Task<IActionResult> UpdateEmployee(EmployeeViewModel employeeViewModel)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var employee = await eMPDBContext.Employee
                   .Where(e => e.Employee_ID == employeeViewModel.Employee_ID)
                   .FirstAsync();

                employee.Employee_Name = employeeViewModel.Employee_Name;
                employee.Employee_Surname = employeeViewModel.Employee_Surname;
                employee.Employee_Email = employeeViewModel.Employee_Email;
                employee.GravatarUrl = GravatarHelper.GetGravatarUrl(employeeViewModel.Employee_Email);
                employee.Birth_Date = employeeViewModel.Birth_Date;
                employee.Salary = employeeViewModel.Salary;
                employee.Position_ID = employeeViewModel.Position_ID;
                employee.Manager_ID = employeeViewModel.Manager_ID;

                eMPDBContext.Update(employee);

                await eMPDBContext.SaveChangesAsync();

                return Ok(employee);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal Server Error. Please contact support.");
            }
        }

        [HttpPost]
        [Route("UpdateEmployeeManager")]
        public async Task<IActionResult> UpdateEmployeeManager(EmployeeViewModel employeeViewModel)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var employee = await eMPDBContext.Employee
                   .Where(e => e.Employee_ID == employeeViewModel.Employee_ID)
                   .FirstAsync();

                employee.Manager_ID = employeeViewModel.Manager_ID;

                eMPDBContext.Update(employee);

                await eMPDBContext.SaveChangesAsync();

                return Ok(employee);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal Server Error. Please contact support.");
            }
        }

        [HttpDelete]
        [Route("DeleteEmployee/{employeeID}")]
        public async Task<IActionResult> DeleteEmployee(int employeeID)
        {
            try
            {
                var employee = await eMPDBContext.Employee.FindAsync(employeeID);

                if (employee == null)
                {
                    return NotFound();
                }

                eMPDBContext.Employee.Remove(employee);

                await eMPDBContext.SaveChangesAsync();

                return Ok(employee);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal Server Error. Please contact support.");
            }
        }

        public static class GravatarHelper
        {
            public static string GetGravatarUrl(string email)
            {
                var emailLower = email.Trim().ToLower();
                using (var md5 = MD5.Create())
                {
                    var hash = md5.ComputeHash(Encoding.UTF8.GetBytes(emailLower));
                    var hashString = BitConverter.ToString(hash).Replace("-", "").ToLower();
                    return $"https://www.gravatar.com/avatar/{hashString}";
                }
            }
        }

        [HttpGet]
        [Route("ReadAllPositions")]
        public async Task<IActionResult> ReadAllPositions()
        {
            try
            {
                var positions = await eMPDBContext.Position
                    .ToListAsync();

                return Ok(positions);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal Server Error. Please contact support.");
            }
        }

        [HttpGet]
        [Route("ReadOnePosition/{positionID}")]
        public async Task<ActionResult<Position>> ReadOnePosition(int positionID)
        {
            var position = await eMPDBContext.Position.FindAsync(positionID);

            if (position == null)
            {
                return NotFound();
            }

            return position;
        }

        [HttpPost]
        [Route("AddPosition")]
        public async Task<ActionResult<Position>> AddPosition(Position position)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            eMPDBContext.Position.Add(position);
            await eMPDBContext.SaveChangesAsync();

            return position;
        }

        [HttpPut]
        [Route("UpdatePosition/{positionID}")]
        public async Task<IActionResult> PutPosition(int positionID, Position position)
        {
            if (positionID != position.Position_ID)
            {
                return BadRequest();
            }

            eMPDBContext.Entry(position).State = EntityState.Modified;

            try
            {
                await eMPDBContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!eMPDBContext.Position.Any(e => e.Position_ID == positionID))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete]
        [Route("DeletePosition/{positionID}")]
        public async Task<IActionResult> DeletePosition(int positionID)
        {
            var position = await eMPDBContext.Position.FindAsync(positionID);
            if (position == null)
            {
                return NotFound();
            }

            eMPDBContext.Position.Remove(position);
            await eMPDBContext.SaveChangesAsync();

            return NoContent();
        }
    }
}