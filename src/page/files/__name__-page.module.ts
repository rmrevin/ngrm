import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { <%= classify(name) %>PageComponent } from './<%= name %>-page.component';
import { <%= classify(name) %>PageRouting } from './<%= name %>-page.routing';

@NgModule({
  imports: [
    // angular
    CommonModule,
    // application
    // module
    <%= classify(name) %>PageRouting,
    // vendor
  ],
  declarations: [<%= classify(name) %>PageComponent],
})
export class <%= classify(name) %>PageModule
{
}
