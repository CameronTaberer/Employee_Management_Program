import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganisationStructureComponent } from './organisation-structure/organisation-structure.component';

const routes: Routes = [
  {
    path:'',
    component: OrganisationStructureComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
