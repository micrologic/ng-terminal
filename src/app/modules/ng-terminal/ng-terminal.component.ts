import { Component, OnInit, OnChanges, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import {
    trigger,
    state,
    style,
    animate,
    transition
} from '@angular/animations';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ElementRef, Renderer2 } from '@angular/core';
import { TerminalBuffer } from './terminal-buffer';
@Component({
    selector: 'ng-terminal',
    templateUrl: './ng-terminal.component.html',
    styleUrls: ['./ng-terminal.component.css'],
    animations: [
        trigger('cursorState', [
            state('inactive', style({
                background: 'white'
            })),
            state('active', style({
            })),
            transition('* <=> *', animate('100ms'))
        ])
    ]
})
export class NgTerminalComponent implements OnInit, OnChanges {
    @ViewChild('terminalViewPort') terminalViewPort: ElementRef;
    @ViewChild('terminalCanvas') terminalCanvas: ElementRef;
    @ViewChild('virtualViewPort') virtualViewPort: ElementRef;
    public bf = new TerminalBuffer();
    private keyEventQueue = new Array<any>();
    @Output() onInit = new EventEmitter<TerminalBuffer>();
    @Output() onKey = new EventEmitter<KeyboardEvent>();
    @Input() renderHtmlStrategy: (item: string) => { html: string, isContainingCharacter: boolean };
    @Input() viewMode = false;
    virtualTop = 0;
    //    logging = '';
    constructor() {
    }

    ngOnInit() {
        this.onInit.next(this.bf);
        this.bf.getWriteObservable().subscribe((str) => {
            this.scrollDown();
        })
    }

    ngOnChanges() {
        if (this.renderHtmlStrategy != undefined && this.renderHtmlStrategy != null)
            this.bf.setRenderHtmlStrategy(this.renderHtmlStrategy);
    }

    onTextInput($event: TextEvent) {
        //        this.logging = this.logging + "|event.type " + $event.type + ":" + $event.data
        let ke = new KeyboardEvent($event.type, { key: $event.data });
        if (this.isCanvasInFocus() && ($event.data < '\u007f')) { //only read ascii, ignore high unicode. it removes duplicate with compositionend in mobile
            this.keyEventQueue.push(ke);
            this.emitNextKey();
        }
    }

    onKeyDown($event) {
        if (this.isCanvasInFocus()) {
            //            this.logging = this.logging + "|event.type " + $event.type + ":" + $event.key
            this.keyEventQueue.push($event);
            $event.preventDefault();
            this.emitNextKey();
        }
    }

    onKeyUp($event) {
        this.keyEventQueue.push($event);
        $event.preventDefault();
        this.emitNextKey();
    }

    onScroll($event: Event) { // move virtual viewport
        this.virtualTop = $event.srcElement.scrollTop;
    }

    scrollDown() { //scroll to end of viewport
        setTimeout(() => {
            this.terminalCanvas.nativeElement.scrollTop = this.terminalCanvas.nativeElement.scrollHeight;
        }, 200);
    }

    private emitNextKey() {
        if (this.keyEventQueue.length > 0) {
            let first = this.keyEventQueue.splice(0, 1)[0];
            this.onKey.emit(first);
        }
    }

    private isCanvasInFocus() {
        return this.virtualViewPort.nativeElement == document.activeElement;
    }

    onViewPortFocus() {
    }

    compositionstart($event) {
        //        this.logging = this.logging + "|event.type " + $event.type + ":" + $event.data
        //console.log("event.type " + $event.type + ":" + $event.data);
        let ke = new KeyboardEvent($event.type, { key: $event.data });
        this.keyEventQueue.push(ke);
        this.emitNextKey();
    }

    compositionend($event: CompositionEvent) {
        //        this.logging = this.logging + "|event.type " + $event.type + ":" + $event.data
        //console.log("event.type " + $event.type + ":" + $event.data);
        let ke = new KeyboardEvent($event.type, { key: $event.data });
        this.keyEventQueue.push(ke);
        this.emitNextKey();
    }
    compositionupdate($event) {
        //        this.logging = this.logging + "|event.type " + $event.type + ":" + $event.data
        //console.log("event.type " + $event.type + ":" + $event.data);
        let ke = new KeyboardEvent($event.type, { key: $event.data });
        this.keyEventQueue.push(ke);
        this.emitNextKey();
    }
}
