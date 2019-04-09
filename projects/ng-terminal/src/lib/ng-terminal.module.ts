import { NgModule } from '@angular/core';
import { NgTerminalComponent } from './ng-terminal.component';
import { ResizableModule } from 'angular-resizable-element';
import { GlobalStyleComponent } from './global-style/global-style.component';

@NgModule({
  declarations: [NgTerminalComponent, GlobalStyleComponent],
  imports: [
    ResizableModule
  ],
  exports: [NgTerminalComponent]
})
export class NgTerminalModule { }
