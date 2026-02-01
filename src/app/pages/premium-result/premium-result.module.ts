import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PremiumResultPageRoutingModule } from './premium-result-routing.module';

import { PremiumResultPage } from './premium-result.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PremiumResultPageRoutingModule
  ],
  declarations: [PremiumResultPage]
})
export class PremiumResultPageModule {}
