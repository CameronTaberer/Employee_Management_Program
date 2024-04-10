using System.ComponentModel.DataAnnotations;

namespace Employee_Management_Program_API.Models
{
    public class Position
    {
        [Key]
        public int Position_ID { get; set; }

        [Required]
        public string Position_Name { get; set; } = string.Empty;

        [Required]
        public int Hierarchy_Level { get; set; }
    }
}