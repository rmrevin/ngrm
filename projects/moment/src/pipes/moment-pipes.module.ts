import { NgModule } from '@angular/core';
import { MomentPipe } from './moment.pipe';

const pipes = [MomentPipe];

@NgModule({
  declarations: pipes,
  exports: pipes,
})
export class MomentPipesModule
{
}
