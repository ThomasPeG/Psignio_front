import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PremiumResultPage } from './premium-result.page';

const routes: Routes = [
  {
    path: '',
    component: PremiumResultPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PremiumResultPageRoutingModule {}
