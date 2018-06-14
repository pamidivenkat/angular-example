import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';

import { AeAutocompleteComponent } from './ae-autocomplete.component'
import { AeInputComponent } from '../../atlas-elements/ae-input/ae-input.component';
import { AeDatasourceType } from '../../atlas-elements/common/ae-datasource-type';

describe('Auto complete Component', () => {
    let component: AeAutocompleteComponent<string>;
    let fixture: ComponentFixture<AeAutocompleteComponent<string>>;
    let mockItems: any[];
    mockItems = [{ name: 'Complete', id: 2 }, { name: 'In Progress', id: 1 }, { name: 'To Do', id: 0 }];
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AeAutocompleteComponent, AeInputComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .overrideComponent(AeAutocompleteComponent, { set: { host: { "(click)": "dummy" } } })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AeAutocompleteComponent);
        component = fixture.componentInstance;
        component.id = "testautocompleteid";
        component.name = "testautocompletename";
        component.items = mockItems;
        component.field = "name";
        component.valuefield = "id";
        component.datasourceType = 0;
        fixture.detectChanges();
    });

    it('should launch auto complete component', () => {
        expect(component).toBeTruthy();
    });

    it('Should have input element to search items', () => {
        let inputElement = fixture.debugElement.query(By.css('input'));
        expect(inputElement.componentInstance.constructor.name).toEqual('AeInputComponent');
        expect(inputElement).not.toBeNull();
    });

    it('Id attribute should has provided value', () => {
        let inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(inputElement.id).toEqual("testautocompleteid");
    });

    it('name attribute should has provided value', () => {
        let inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(inputElement.name).toEqual("testautocompletename");
    });

    it('should display provided placeholder text in input element', () => {
        component.placeholder = "Select status";
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        let inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(inputElement.placeholder).toEqual("Select status");
    });

    it('placeholder should be empty when placeholder text not provided', () => {
        let inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(inputElement.placeholder).toEqual('undefined');
    });

    it('should fire change event and Verifying the options in autocomplete', () => {
        spyOn(component, 'onInput');
        let inputElement = fixture.debugElement.query(By.css('input'));
        let objValue = { target: { value: '' } };
        inputElement.triggerEventHandler('input', objValue);
        fixture.debugElement.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.onInput).toHaveBeenCalled();
        expect(component.filteredList.length).toEqual(3);
    });

    describe('Single selection auto complete Component', () => {

        beforeEach(() => {
            component.onFocus('');
            fixture.debugElement.triggerEventHandler('click', null);
            fixture.detectChanges();
        });

        it('Should not have multiple select container', () => {
            let ulElement = fixture.debugElement.query(By.css('.ui-autocomplete-multiple-container'));
            expect(ulElement).toBeNull();
            expect(component.multiselect).toBeFalsy();
        });

        it('Items list in panel should be filtered based on the search text', () => {
            let inputElement = fixture.debugElement.query(By.css('input'));
            let objValue = { target: { value: 'To' } };
            inputElement.triggerEventHandler('input', objValue);
            fixture.debugElement.triggerEventHandler('click', null);
            fixture.detectChanges();
            let itemsCount = fixture.debugElement.query(By.css('.ui-autocomplete-list-item')).childNodes.length
            expect(component.filteredList.length).toEqual(1);
            expect(itemsCount).toEqual(3);
        });

        it('Should display No Result Found text in panel when there are no matching items', () => {
            let inputElement = fixture.debugElement.query(By.css('input'));
            let objValue = { target: { value: 'Too' } };
            inputElement.triggerEventHandler('input', objValue);
            fixture.debugElement.triggerEventHandler('click', null);
            fixture.detectChanges();
            let panelField = fixture.debugElement.query(By.css('.ui-autocomplete-items li')).nativeElement;
            expect(panelField.innerText).toEqual('No Result Found');
        });

        it('selectItem function should be called when selected item from autocomplete list ', () => {
            spyOn(component, 'selectItem');
            let listItemElement = fixture.debugElement.query(By.css('li.ui-autocomplete-list-item'));
            listItemElement.triggerEventHandler('mousedown', component.filteredList[0]);
            fixture.debugElement.triggerEventHandler('click', null);
            fixture.detectChanges();
            expect(component.selectItem).toHaveBeenCalled();
        });

        it('Input field should be populated with selected item text', () => {
            component.value = [{ id: mockItems[0].id, name: mockItems[0].name }];
            fixture.debugElement.triggerEventHandler('click', null);
            fixture.detectChanges();
            expect(component.inputValue).toEqual(mockItems[0].name);
        });

        it('should not visible clear all icon', () => {
            let iconElement = fixture.debugElement.query(By.css('#iconweone'));
            expect(iconElement).toBeNull();
        });

        it('Search items when datasource type is remote', () => {
            component.datasourceType = AeDatasourceType.Remote;
            let inputElement = fixture.debugElement.query(By.css('input'));
            let objValue = { target: { value: 'test' } };
            inputElement.triggerEventHandler('input', objValue);       
            fixture.debugElement.triggerEventHandler('click', null);
            fixture.detectChanges();
            expect(component.isLoading).toBeTruthy();
            expect(component.loadingText).toEqual("Searching ...");
        });

    });

    describe('Multi selection - Auto complete Component', () => {
        beforeEach(() => {
            component.multiselect = true;
            component.onFocus('');
            fixture.debugElement.triggerEventHandler('click', null);
            fixture.detectChanges();
        });

        it('Should have multiple select container', () => {
            expect(component.multiselect).toBeTruthy();
            let ulElement = fixture.debugElement.query(By.css('.ui-autocomplete-multiple-container'));
            expect(ulElement).not.toBeNull();
        });

        it('Should display No Result Found text in panel when there are no matching items', () => {
            let inputElement = fixture.debugElement.query(By.css('input'));
            let objValue = { target: { value: 'Too' } };
            inputElement.triggerEventHandler('input', objValue);
            fixture.debugElement.triggerEventHandler('click', null);
            fixture.detectChanges();
            let panelField = fixture.debugElement.query(By.css('.ui-autocomplete-items li')).nativeElement;
            expect(panelField.innerText).toEqual('No Result Found');
        });

        it('Items in panel should be filtered based on the search text', () => {
            let inputElement = fixture.debugElement.query(By.css('input'));
            let objValue = { target: { value: 'Complete' } };
            inputElement.triggerEventHandler('input', objValue);
            fixture.debugElement.triggerEventHandler('click', null);
            fixture.detectChanges();
            expect(component.filteredList.length).toEqual(1);
        });

        it('should be pre populated with selected items and clear icon should be visible', () => {
            component.value = mockItems.filter(x => x.name != 'To Do'); // pre selected items
            component.ngOnInit();
            fixture.debugElement.triggerEventHandler('click', null);
            fixture.detectChanges();
            let iconElement = fixture.debugElement.query(By.css('#iconweone'));
            expect(iconElement).not.toBeNull();
            expect(component.selectedItems.length).toEqual(2);
            expect(component.filteredList.length).toEqual(1);
        });

    });

});

