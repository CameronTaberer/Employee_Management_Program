import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { EmployeeService } from '../services/employee/employee.service';
import { Employee } from '../models/employee/employee.model';
import { Position } from '../models/employee/position.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-organisation-structure',
  templateUrl: './organisation-structure.component.html',
  styleUrls: ['./organisation-structure.component.scss']
})

export class OrganisationStructureComponent implements OnInit {

  constructor(private employeeService: EmployeeService, private toast: NgToastService, private changeDetectorRef: ChangeDetectorRef) { }


  //////////////////////////////////////////// Variables, Objects and array Initialization ////////////////////////////////////////

  selectedNodes!: TreeNode[];
  employees: Employee[] = [];
  managers: Employee[] = [];
  positions: Position[] = [];
  data: TreeNode[] = [];
  filteredManagers: Employee[] = [];
  filteredPositions: Position[] = [];
  filteredEmployees: Employee[] = [];
  checkEmployees: Employee[] = [];
  searchedPositions: Position[] = [];

  // This array was delcared to give the items in the array a value which is used in the filter
  // function to determine which data attribute the search string applies to, when searching the employee table.
  items: any[] = [
    {label: 'All', value: 'All'},
    {label: 'Employee No.', value: 'employee_ID'},
    {label: 'Name', value: 'employee_Name'},
    {label: 'Surname', value: 'employee_Surname'},
    {label: 'Email', value: 'employee_Email'},
    {label: 'Birth Date', value: 'birth_Date'},
    {label: 'Salary', value: 'salary'},
    {label: 'Position', value: 'position.position_Name'},
    {label: 'Manager', value: 'manager_ID'}
  ];

  currentPosition: Position | null = null;
  employeeNameMap: { [id: number]: string } = {};
  
  selectedPositionID: number | null = null;
  originalManagerID: number = 0
  activeIndex: number = 0;
  positionID:number = 0;
  positionName: String = '';

  selectedFilter: any = '';
  filter: string = 'All';
  searchTerm: string = '';
  searchString: string = '';
  employeeFullName: string ='';
  
  position_Object: Position = {} as Position;
  manager_Object: Employee = {} as Employee;
  oneEmployee: Employee = {} as Employee;
  positionHierarchyMap: { [positionId: number]: number } = {};

  visibleDelete: boolean = false;
  visibleAddUpdatePosition = false;
  straightDelete: boolean = false;
  visiblePositionDelete: boolean = false;
  zoomedOut = false;
  visibleAddUpdate: boolean = false;
  visibleReassign: boolean = false;
  isAdd: boolean = true;

  ngOnInit(): void {
    this.getAllEmployees();
    this.getAllPositions();
  }

  /////////////////////////////////////////////////// CRUD Methods /////////////////////////////////////////////////////

  addEmployee(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        const emailExists = employees.some(employee => employee.employee_Email === this.oneEmployee.employee_Email);
        if (emailExists) {
          this.toast.error({detail:"ERROR", summary:"An employee with this email already exists", duration:5000});
          return;
        }
        this.oneEmployee.position_ID = this.position_Object.position_ID;
        this.oneEmployee.manager_ID = this.manager_Object.employee_ID || 0;
        this.employeeService.addEmployee(this.oneEmployee).subscribe({
          next: () => {
            this.getAllEmployees(); 
            this.closeDialog();
            this.toast.success({detail:"SUCCESS", summary:"Employee added successfully", duration:5000});
          },
          error: () => {
            this.toast.error({detail:"ERROR", summary:"Failed to add employee", duration:5000});
          }
        });
      },
      error: () => {
        this.toast.error({detail:"ERROR", summary:"Failed to load employees", duration:5000});
      }
    });
  }

  getAllEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.managers = employees.map((manager: any) => ({
          ...manager,
          full_Name: `${manager.employee_Name} ${manager.employee_Surname}`
        }));
        this.filteredManagers = this.managers;
        this.employeeNameMap = employees.reduce((acc, employee) => {
          acc[employee.employee_ID] = `${employee.employee_Name} ${employee.employee_Surname}`;
          return acc;
        }, {} as { [id: number]: string });
        this.filterEmployees();
        const hierarchicalEmployees: Employee[] = this.buildHierarchy(employees);
        this.data = this.transformEmployeesToTreeNodes(hierarchicalEmployees);
      },
      error: () => {
        this.toast.error({detail:"ERROR", summary:"Failed to load employees", duration:5000});
      }
    });
  }
  
  loadEmployee(employeeID: number): void {
    this.isAdd = false;
    this.employeeService.getOneEmployee(employeeID).subscribe({
      next: (employee) => {
        this.oneEmployee = employee;
        const parsedDate = new Date(this.oneEmployee.birth_Date);     
        const formattedDate = parsedDate.getFullYear() + '-' + ('0' + (parsedDate.getMonth() + 1)).slice(-2) + '-' + ('0' + parsedDate.getDate()).slice(-2);
        this.oneEmployee.birth_Date = formattedDate;
        this.position_Object = this.oneEmployee.position;
        this.manager_Object = this.managers.find(manager => manager.employee_ID == this.oneEmployee.manager_ID) || {} as Employee;
        this.filteredManagers = this.filteredManagers.filter(manager => manager.employee_ID !== employeeID); 
        this.filteredManagers = this.managers.filter(e => e.position.hierarchy_Level < this.position_Object.hierarchy_Level);
      },
      error: () => {
        this.toast.error({detail:"ERROR", summary:"Failed to load employee", duration:5000});
      }
    });
    this.showDialog();
  }

  updateEmployee(): void {
    this.oneEmployee.position_ID = this.position_Object.position_ID;
    this.oneEmployee.manager_ID = this.manager_Object.employee_ID;
    this.employeeService.updateEmployee(this.oneEmployee).subscribe({
      next: () => {
        this.getAllEmployees();
        this.getAllPositions();
        this.closeDialog();
        this.toast.success({detail:"SUCCESS", summary:"Updated employee successfully", duration:5000});
      },
      error: () => {
        this.toast.error({detail:"ERROR", summary:"Failed to update employee", duration:5000});
      }
    });
  }

  reassignAndDeleteManager(originalManagerID: number): void {
    this.checkEmployees.forEach(employee => {
      let updatedEmployee = {
        ...employee,
        manager_ID: employee.managerForDropdown?.employee_ID || 0
      };
      this.employeeService.updateEmployeeManager(updatedEmployee).subscribe({
        next: () => {
          
        }
      });
    });
    this.deleteEmployee(originalManagerID);
  }

  updateEmployeeManager(employee: Employee, newManagerID: number): void {
    employee.manager_ID = newManagerID;
    this.employeeService.updateEmployeeManager(employee).subscribe({
      next: () => {
        this.toast.success({detail:"SUCCESS", summary:"Employee reassigned successfully", duration:5000});
      },
      error: () => {
        this.toast.error({detail:"ERROR", summary:"Failed to reassign employee", duration:5000});
      }
    });
  }

  deleteEmployee(managerID: number): void {
    this.employeeService.deleteEmployee(managerID).subscribe({
      next: () => {
        this.getAllEmployees();
        this.toast.success({detail:"SUCCESS", summary:"Employee deleted successfully", duration:5000});
      },
      error: () => {
        this.toast.error({detail:"ERROR", summary:"Failed to delete employee", duration:5000});
      }
    });
  }

  savePosition(): void {
    if (this.currentPosition) {
      if (this.selectedPositionID) {
        this.employeeService.updatePosition(this.selectedPositionID, this.currentPosition).subscribe({
          next: () => {
            this.getAllEmployees();
            this.getAllPositions();
            this.visibleAddUpdatePosition = false;
            this.toast.success({detail:"SUCCESS", summary:"Position updated successfully", duration:5000});
          },
          error: () => {
            this.toast.error({detail:"ERROR", summary:"Failed to update position", duration:5000});
          }
        });
      } else {
        this.employeeService.addPosition(this.currentPosition).subscribe({
          next: () => {
            this.getAllEmployees();
            this.getAllPositions();
            this.visibleAddUpdatePosition = false;
            this.toast.success({detail:"SUCCESS", summary:"Position added successfully", duration:5000});
          },
          error: () => {
            this.toast.error({detail:"ERROR", summary:"Failed to add position", duration:5000});
          }
        });
      }
    }
  }
  
  getAllPositions(): void {
    this.employeeService.getAllPositions().subscribe({
      next: (positions) => {
        this.positions = positions;
        this.filteredPositions = positions;

        positions.forEach(position => {
          this.positionHierarchyMap[position.position_ID] = position.hierarchy_Level;
        });

        this.applyFilter();
      },
      error: () => {
        this.toast.error({detail: "ERROR", summary: "Failed to load positions", duration: 5000});
      }
    });
  }
  
  deletePosition(positionID: number): void {
    this.employeeService.deletePosition(positionID).subscribe({
      next: () => {
        this.getAllEmployees();
        this.getAllPositions();
        this.toast.success({detail:"SUCCESS", summary:"Position deleted successfully", duration:5000});
      },
      error: () => {
        this.toast.error({detail:"ERROR", summary:"Failed to delete Position", duration:5000});
      }
    });
  }
  
  /////////////////////////////////////////////////// Search and Filter methods ////////////////////////////////////////////////

  onSearchChange(): void {
    this.filterEmployees();
  }

  clearSearch(): void {
    this.searchTerm='';
    this.filterEmployees();
  }

  onPositionSearch(searchTerm: string): void {
    this.searchString = searchTerm;
    this.applyFilter();
  }

  clearPositionSearch(): void {
    this.searchString = '';
    this.applyFilter();
  }

  onFilterChange(filter: any): void {
    this.selectedFilter = filter;
    this.filter = filter.value
    this.filterEmployees();
  }

  filterEmployees(): void {
    // List data attribute properties to ignore during the search.
    const excludeProperties = ['position_ID'];

    // Filters manager IDs based on whether their associated names include the search term.
    const matchingManagerIds = Object.entries(this.employeeNameMap)
      .filter(([_, managerName]) => managerName.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .map(([managerId, _]) => Number(managerId));
    
    // Filters the employees based on a search term and additional criteria.
    this.filteredEmployees = this.employees.filter(employee => {
      // If 'All' is selected as filter, examine all relevant properties of each employee.
      if (this.filter === 'All') {
        return Object.entries(employee).some(([key, value]) => {
          // Skip excluded properties.
          if (excludeProperties.includes(key)) {
            return false;
          }
          // For 'manager_ID', check if it matches any of the filtered manager IDs.
          if (key === 'manager_ID') {
            return matchingManagerIds.includes(employee.manager_ID);
          }
          // For object-type properties, check each nested property for a match.
          if (typeof value === 'object' && value !== null) {
            return Object.entries(value).some(([nestedValue]) => 
              nestedValue?.toString().toLowerCase().includes(this.searchTerm.toLowerCase()));
          } else {
            // For direct properties, check if their string representation includes the search term.
            return value.toString().toLowerCase().includes(this.searchTerm.toLowerCase());
          }
        });
      } else {
        // For specific properties indicated by the filter, navigate through the employee object to find the value.
        const propertyPath = this.filter;
        const propertyValue = propertyPath.split('.').reduce((obj, key) => obj && obj[key] ? obj[key] : null, employee);
        // If filtering by 'manager_ID', ensure it's among the matching IDs.
        if (propertyPath === 'manager_ID' && employee.manager_ID) {
          return matchingManagerIds.includes(employee.manager_ID);
        }
        // Check the specific property value for a match with the search term.
        return propertyValue?.toString().toLowerCase().includes(this.searchTerm.toLowerCase());
      }
    });

    // Sorts the filtered list by position hierarchy, ascending.
    this.filteredEmployees.sort((a, b) => {
      // Retrieves hierarchy levels for comparison, with a fallback of 0.
      const hierarchyA = this.positionHierarchyMap[a.position_ID] || 0;
      const hierarchyB = this.positionHierarchyMap[b.position_ID] || 0;
      // Performs the sort based on hierarchy level.
      return hierarchyA - hierarchyB;
    });
  }

  applyFilter(): void {
    if (!this.searchString) {
      this.searchedPositions = this.positions;
    } else {
      this.searchedPositions = this.positions.filter(position =>
        position.position_Name.toLowerCase().includes(this.searchString.toLowerCase()) ||
        position.hierarchy_Level.toString().includes(this.searchString));
    }
  } 

  ///////////////////////////////////////////// Data Transformation ////////////////////////////////////////////

  buildHierarchy(employees: Employee[]): Employee[] {
    // Initialize hierarchy array to hold top-level employees.
    let hierarchy: Employee[] = [];

    // Create map of all employees by their ID.
    // Each employee is cloned with 'subordinates' array to populate.
    const employeesMap = new Map<number, Employee>(
      employees.map(emp => [emp.employee_ID, {...emp, subordinates: []}])
    );

    // Populate the 'subordinates' array for managers and build the hierarchy array.
    employees.forEach(emp => {
      if (emp.manager_ID) {
        // If employee has a manager, add them to their manager's 'subordinates' array.
        const manager = employeesMap.get(emp.manager_ID);
        manager?.subordinates?.push(employeesMap.get(emp.employee_ID) as Employee);
      } else {
        // If no manager present, add employee to the hierarchy array as a top-level employee.
        hierarchy.push(employeesMap.get(emp.employee_ID) as Employee);
      }
    });
    return hierarchy;
  }

  transformEmployeesToTreeNodes(employees: Employee[]): TreeNode[] {
    return employees.map(employee => ({
      // Each node is expanded by default to show the full hierarchy.
      expanded: true,
      type: 'person',
      data: {
        id: employee.employee_ID,
        // Combine the employee's name and surname for display.
        name: `${employee.employee_Name} ${employee.employee_Surname}`,
        // Include the employee's position title if available.
        title: employee.position?.position_Name,
        // Use the employee's gravatar URL for their image.
        image: employee.gravatarUrl,

        position: employee.position
      },
      // Transform any subordinates into children nodes.
      children: employee.subordinates ? this.transformEmployeesToTreeNodes(employee.subordinates) : []
    }));
  }
  
  onPositionSelected(position: Position): void {
    // Check if a position has been selected.
    if (this.position_Object.position_ID) {
      // Filter out managers to include only those whose position hierarchy is higher (numerically lower)
      // than that of the selected position.
      this.filteredManagers = this.managers.filter(e => e.position.hierarchy_Level < position.hierarchy_Level);
    } else {
      // If no position is selected, show all managers.
      this.filteredManagers = this.managers;
    }
  }

  onManagerSelected(manager: Employee): void {
    // Check if a manager has been selected.
    if (this.manager_Object.employee_ID) {
      // Filter out positions to include only those whose hierarchy level is lower (numerically higher)
      // than that of the manager's current position.
      this.filteredPositions = this.positions.filter(p => p.hierarchy_Level > manager.position.hierarchy_Level);
    } else {
      // If no manager is selected, show all positions.
      this.filteredPositions = this.positions;
    }
  }

  checkOrDeleteManager(managerID: number, fullName: string, position: Position): void {
    this.employeeFullName = fullName;
    this.originalManagerID = managerID; 
    const subordinates = this.employees.filter(e => e.manager_ID === managerID);
    if (subordinates.length > 0) {
      this.checkEmployees = subordinates.map(subordinate => {
        // const managerForDropdown = this.managers.find(m => m.employee_ID === subordinate.manager_ID);
        return { ...subordinate};
        // , managerForDropdown 
      });
      this.managers = this.managers.filter(manager => manager.employee_ID !== managerID);
      
      this.showReassignDialog();
    } else {
        this.straightDelete = true;
        this.showDeleteConfirmDialog();
    }
  }

  allDropdownsFilled(): boolean {
    for (const employee of this.checkEmployees) {
      if (!employee.managerForDropdown) {
        return false;
      }
    }
    return true;
  }

  ////////////////////////////////////////////// Modal Opening and closing Methods ///////////////////////////////////////////

  showDeleteConfirmDialog() {
    this.visibleDelete = true;
  } 

  closeDeleteConfirmDialog() {
    this.visibleDelete = false;
    this.straightDelete = false;
  }

  showDialog() {
    this.visibleAddUpdate = true;
  } 

  closeDialog() {
    this.getAllEmployees();
    this.getAllPositions();
    this.isAdd = true;
    this.visibleAddUpdate = false;
    this.position_Object = {} as Position;
    this.manager_Object = {} as Employee;
    this.oneEmployee = {} as Employee;
  }

  showReassignDialog() {
    this.visibleReassign = true;
  } 

  closeReassignDialog() {
    this.getAllEmployees();
    this.getAllPositions();
    this.visibleReassign = false;
  }

  showPositionDeleteConfirmDialog(positionID: number, postionName: string) {
    this.visiblePositionDelete = true;
    this.positionID = positionID;
    this.positionName = postionName;
  } 

  closePositionDeleteConfirmDialog() {
    this.visiblePositionDelete = false;
  }

  openAddPositionModal(): void {
    this.currentPosition = { position_ID: 0, position_Name: '', hierarchy_Level: 0 };
    this.visibleAddUpdatePosition = true;
    this.selectedPositionID = null;
  }

  openUpdatePositionModal(position: Position): void {
    this.isAdd = false;
    this.currentPosition = { ...position };
    this.visibleAddUpdatePosition = true;
    this.selectedPositionID = position.position_ID;
  }

  closeAddUpdatePositionDialog(): void {
    this.getAllEmployees();
    this.getAllPositions();
    this.visibleAddUpdatePosition = false;
    this.isAdd = true;
  }

  toggleZoom() {
    this.zoomedOut = !this.zoomedOut;
  }

  ////////////////////////////////////////////// Export PDF Method ///////////////////////////////////////////////////

  exportPdf() {
    const doc = new jsPDF();
    const columns = [
      { header: 'Employee No.', dataKey: 'employee_ID' },
      { header: 'Full Name', dataKey: 'fullName' },
      { header: 'Email', dataKey: 'employee_Email' },
      { header: 'Position', dataKey: 'position' },
      { header: 'Line Manager', dataKey: 'lineManager' },
    ];
    const rows = this.filteredEmployees.map(emp => ({
      employee_ID: emp.employee_ID,
      fullName: `${emp.employee_Name} ${emp.employee_Surname}`,
      employee_Email: emp.employee_Email,
      position: emp.position?.position_Name || 'N/A',
      lineManager: this.employeeNameMap[emp.manager_ID] || 'N/A',
    }));
    autoTable(doc, { columns, body: rows });
    doc.save('Employee_List.pdf');
  }
}
