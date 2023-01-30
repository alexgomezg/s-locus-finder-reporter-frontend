import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FamilyComponent} from './components/family/family.component';
import {ResultComponent} from './components/result/result.component';
import {FamiliesTreeComponent} from './components/families-tree/families-tree.component';

const routes: Routes = [
  {
    path: '',
    component: FamiliesTreeComponent
  },
  {
    path: 'family/:id',
    component: FamilyComponent
  },
  {
    path: 'species/:family/:id',
    component: ResultComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
