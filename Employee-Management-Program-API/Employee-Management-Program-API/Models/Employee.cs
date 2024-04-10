using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Employee_Management_Program_API.Models
{
    public class Employee
    {
        [Key]
        public int Employee_ID { get; set; }

        [Required]
        public string Employee_Name { get; set; } = string.Empty;

        [Required]
        public string Employee_Surname { get; set; } = string.Empty;

        [Required]
        public string Employee_Email { get; set; } = string.Empty;

        public string GravatarUrl { get; set; } = string.Empty;

        [Required]
        public DateTime Birth_Date { get; set; }

        [Required]
        public decimal Salary { get; set; }

        [Required]
        public int Position_ID { get; set; }

        [Required]
        public int Manager_ID { get; set; }

        [ForeignKey("Position_ID")]
        public Position? Position { get; set; }
    }
}