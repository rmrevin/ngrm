import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule, ViewEncapsulation } from '@angular/core';
import { ReloadAction } from './actions';
import { UiStore } from './store';

@Component({
  selector: 'ui-component',
  template: `
      <div>
          <p *ngIf="inProgress|async">
              Please wait...
          </p>

          <p *ngIf="ready|async">
              Scene ready.
          </p>

          <a (click)="reload()">reload</a>
      </div>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UiStore],
})
export class UiComponent
{
  public readonly ready = this.store.select(state => state.ready);
  public readonly inProgress = this.store.select(state => state.inProgress);

  public constructor (private store: UiStore) {}

  public reload (): void {
    this.store.dispatch(new ReloadAction());
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [UiComponent],
})
class UiComponentModule
{
}
