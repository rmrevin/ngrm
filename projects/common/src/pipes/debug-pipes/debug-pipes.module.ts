import { NgModule } from '@angular/core';
import { DbgPipe } from './dbg.pipe';
import { LogPipe } from './log.pipe';

const pipes = [DbgPipe, LogPipe];

@NgModule({
  declarations: pipes,
  exports: pipes,
})
export class DebugPipesModule
{
}
