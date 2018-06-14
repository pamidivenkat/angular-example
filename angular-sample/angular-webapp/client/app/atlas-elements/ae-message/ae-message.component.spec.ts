import { AeLabelStyle } from '../common/ae-label-style.enum';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AeMessageComponent } from './ae-message.component';
import { MessageType } from '../common/ae-message.enum';

describe('AeMessageComponent', () => {
    let component: AeMessageComponent;
    let fixture: ComponentFixture<AeMessageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AeMessageComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AeMessageComponent);
        component = fixture.componentInstance;
        component.id = "testMessage";
        component.name = "testMessage";
        fixture.detectChanges();
    });

    it('should have a defined component', () => {
        expect(component).toBeDefined();
    });

    it('should have Message Type input property', () => {
        expect(component.messageType).toBeDefined();
    });

    it('should set correct message type class', () => {
        component.messageType = MessageType.Info;
        fixture.componentInstance.cdRef.markForCheck();
        fixture.detectChanges();
        let inputEl: HTMLElement = fixture.debugElement.query(By.css('#testMessage')).nativeElement;
        expect(inputEl.classList.contains('message--okay')).toEqual(true);

        component.messageType = MessageType.Alert;
        fixture.componentInstance.cdRef.markForCheck();
        fixture.detectChanges();
        let inputElement2: HTMLElement = fixture.debugElement.query(By.css('#testMessage')).nativeElement;
        expect(inputElement2.classList.contains('message--alert')).toEqual(true);

        component.messageType = MessageType.Warning;
        fixture.componentInstance.cdRef.markForCheck();
        fixture.detectChanges();
        let inputElement3: HTMLElement = fixture.debugElement.query(By.css('#testMessage')).nativeElement;
        expect(inputElement3.classList.contains('message--warning')).toEqual(true);
    });

    it('should set correct icon text class based on the input value', () => {
        component.style = AeLabelStyle.Action;
        //component._isAction();
        fixture.componentInstance.cdRef.markForCheck();
        fixture.detectChanges();
        let inputElement: HTMLElement = fixture.debugElement.query(By.css('.icon-with-text__icon')).nativeElement;
        expect(inputElement.classList.contains('icon-with-text--action')).toEqual(true);

        component.style = AeLabelStyle.Medium;
        //component._isMedium();
        fixture.componentInstance.cdRef.markForCheck();
        fixture.detectChanges();
        let inputElement2: HTMLElement = fixture.debugElement.query(By.css('.icon-with-text__icon')).nativeElement;
        expect(inputElement2.classList.contains('icon-with-text--medium')).toEqual(true);

        component.style = AeLabelStyle.Bold;
        //component._isBlod();
        fixture.componentInstance.cdRef.markForCheck();
        fixture.detectChanges();
        let inputElement3: HTMLElement = fixture.debugElement.query(By.css('.icon-with-text__icon')).nativeElement;
        expect(inputElement3.classList.contains('icon-with-text--bold')).toEqual(true);
    });

    it('should check Icon visiblity on Icon input value', () => {
        component.icon = 'icon-bell';
        //component._isIcon();
        fixture.componentInstance.cdRef.markForCheck();
        fixture.detectChanges();
        let IconId = component.getChildId('AeIcon', 1);
        let element: DebugElement = fixture.debugElement.query(By.css('#' + IconId));
        expect(element === null).toBe(false);
    });
})