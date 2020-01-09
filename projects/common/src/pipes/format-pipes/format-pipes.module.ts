import { NgModule } from '@angular/core';
import { HighlightPipe } from './highlight.pipe';
import { MoneyPipe } from './money.pipe';
import { NumberPipe } from './number.pipe';
import { PluralPipe } from './plural.pipe';
import { SrcsetPipe } from './srcset.pipe';

const pipes = [HighlightPipe, MoneyPipe, NumberPipe, PluralPipe, SrcsetPipe];

@NgModule({
  declarations: pipes,
  exports: pipes,
})
export class FormatPipesModule
{
}
