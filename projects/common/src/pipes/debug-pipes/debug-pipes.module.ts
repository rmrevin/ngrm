import { NgModule } from '@angular/core';
import { LogPipe } from './log.pipe';

const pipes = [LogPipe];

@NgModule({
  declarations: [...pipes],
  exports: [...pipes],
})
export class DebugPipesModule
{
}
