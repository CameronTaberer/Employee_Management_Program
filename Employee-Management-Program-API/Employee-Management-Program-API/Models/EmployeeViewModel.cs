namespace Employee_Management_Program_API.Models
{
    public class EmployeeViewModel
    {
        public int Employee_ID { get; set; }

        public string Employee_Name { get; set; } = string.Empty;

        public string Employee_Surname { get; set; } = string.Empty;

        public string Employee_Email { get; set; } = string.Empty;

        public string GravatarUrl { get; set; } = string.Empty;

        public DateTime Birth_Date { get; set; }

        public decimal Salary { get; set; }

        public int Position_ID { get; set; }

        public int Manager_ID { get; set; }
    }
}