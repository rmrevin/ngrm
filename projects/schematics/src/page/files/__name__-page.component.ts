import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-<%= name %>-page',
  template: `
    <div class="<%= name %>-page">
      <router-outlet></router-outlet>
    </div>`,
})
export class <%= classify(name) %>PageComponent implements OnInit
{
  public constructor () {

  }

  public ngOnInit (): void {

  }
}
