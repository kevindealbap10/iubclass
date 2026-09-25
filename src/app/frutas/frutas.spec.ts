import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Frutas } from './frutas';

describe('Frutas', () => {
  let component: Frutas;
  let fixture: ComponentFixture<Frutas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Frutas],
    }).compileComponents();

    fixture = TestBed.createComponent(Frutas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
