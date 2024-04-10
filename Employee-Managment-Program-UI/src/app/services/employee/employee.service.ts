import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { Employee } from '../../models/employee/employee.model';
import { Position } from '../../models/employee/position.model';

@Injectable({
  providedIn: 'root'
})

export class EmployeeService {

  constructor(private http: HttpClient) {}
  
  baseApiUrl: string = environment.baseApiUrl

  addEmployee(employeeData: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseApiUrl}/api/Employee/AddEmployee`, employeeData);
  }

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseApiUrl}/api/Employee/ReadAllEmployees`).pipe(
      map(employees => {
        return employees;
      }),
      catchError(error => {
        console.log(error);
        throw error;
      })
    );
  }

  getOneEmployee(employeeID: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseApiUrl}/api/Employee/ReadOneEmployee/` + employeeID)
  }

  updateEmployee(employeeData: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseApiUrl}/api/Employee/UpdateEmployee`, employeeData);
  } 

  updateEmployeeManager(employeeData: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseApiUrl}/api/Employee/UpdateEmployeeManager`, employeeData);
  }

  deleteEmployee(employeeID: number): Observable<Employee> {
    return this.http.delete<Employee>(`${this.baseApiUrl}/api/Employee/DeleteEmployee/` + employeeID);
  }

  addPosition(position: Position): Observable<Position> {
    return this.http.post<Position>(`${this.baseApiUrl}/api/Employee/AddPosition`, position);
  }

  getAllPositions(): Observable<Position[]> {
    return this.http.get<Position[]>(`${this.baseApiUrl}/api/Employee/ReadAllPositions`).pipe(
      map(positions => {
        return positions;
      }),
      catchError(error => {
        console.log(error);
        throw error;
      })
    );
  }

  getOnePosition(positionID: number): Observable<Position> {
    return this.http.get<Position>(`${this.baseApiUrl}/api/Employee/ReadOnePosition/` + positionID);
  }

  updatePosition(positionID: number, position: Position): Observable<any> {
    return this.http.put(`${this.baseApiUrl}/api/Employee/UpdatePosition/${positionID}`, position);
  }

  deletePosition(positionID: number): Observable<any> {
    return this.http.delete(`${this.baseApiUrl}/api/Employee/DeletePosition/`+ positionID);
  }
}
