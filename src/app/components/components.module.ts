import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthFormComponent } from './auth-form/auth-form.component';

@NgModule({
  declarations: [AuthFormComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  exports: [AuthFormComponent]
})
export class ComponentsModule { }
