import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataService} from './services/data.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Observable} from "rxjs";
import {FormControl} from "@angular/forms";
import {map, startWith} from 'rxjs/operators';


@Component({
  selector: 'slf-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('toSearch') searchInput!: ElementRef<HTMLInputElement>;
  public databaseName?: string;
  public control = new FormControl();
  public filteredFamilies: Observable<string[]> | undefined;
  private families: string[] = []

  constructor(
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly dataService: DataService
  ) {
  }

  public ngOnInit(): void {
    this.dataService.listFamilyNames().subscribe(family => this.families = family)
    this.filteredFamilies = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this.filterFamily(value)),
    );

    this.dataService.getDatabaseInfo()
      .subscribe(info => {
        this.databaseName = info.name
      });
  }

  private filterFamily(value: string): string[] {
    const filterValue = this.normalizeFamily(value);
    return this.families.filter(street => this.normalizeFamily(street).includes(filterValue));
  }

  private normalizeFamily(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  public onFamilySearch(toSearch: string): void {
    this.dataService.findFamilyName(toSearch)
      .subscribe(familyNames => {
        if (familyNames.length === 0) {
          this.snackBar.open(`Unknown family: ${toSearch}`, 'Close', {
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            duration: 4000
          });
        } else {
          const familyName = familyNames[0];

          this.router.navigate(['family', familyName]);
        }
      });
    this.searchInput.nativeElement.value = ""
  }
}
