import { NgModule } from '@angular/core';
import { HighlightPipe } from './highlight.pipe';
import { MomentPipe } from './moment.pipe';
import { MoneyPipe } from './money.pipe';
import { NumberPipe } from './number.pipe';
import { PhonePipe } from './phone.pipe';
import { PluralPipe } from './plural.pipe';
import { SrcsetPipe } from './srcset.pipe';

const pipes = [HighlightPipe, MomentPipe, MoneyPipe, NumberPipe, PhonePipe, PluralPipe, SrcsetPipe];

@NgModule({
  declarations: [...pipes],
  exports: [...pipes],
})
export class FormatPipesModule
{
}
