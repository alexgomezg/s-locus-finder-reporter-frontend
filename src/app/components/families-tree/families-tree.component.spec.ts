import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FamiliesTreeComponent} from './families-tree.component';

describe('HomeComponent', () => {
  let component: FamiliesTreeComponent;
  let fixture: ComponentFixture<FamiliesTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FamiliesTreeComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FamiliesTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
