import { NgModule } from '@angular/core';
import { DebugPipe } from './debug.pipe';
import { LogPipe } from './log.pipe';

const pipes = [DebugPipe, LogPipe];

@NgModule({
  declarations: pipes,
  exports: pipes,
})
export class DebugPipesModule
{
}
