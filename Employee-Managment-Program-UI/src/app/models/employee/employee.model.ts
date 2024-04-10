import { Position } from "./position.model";

export interface Employee {
  [key: string]: any;
  employee_ID: number;
  employee_Name: string;
  employee_Surname: string;
  employee_Email: string;
  gravatarUrl:string;
  birth_Date: string;
  salary: number;
  position_ID: number;
  manager_ID: number;

  position: Position;
  subordinates?: Employee[];
  managerForDropdown?: Employee;
}
