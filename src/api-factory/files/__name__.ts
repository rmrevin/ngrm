import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { <%= classify(name) %>PageComponent } from './<%= name %>-page.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: <%= classify(name) %>PageComponent },
    ]),
  ],
  exports: [RouterModule],
})
export class <%= classify(name) %>PageRouting
{
}
