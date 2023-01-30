import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SpeciesAnalysis} from 'src/app/models/SpeciesAnalysis';
import {DataService} from 'src/app/services/data.service';

import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatPaginatedDataSource} from '../../models/pagination/mat-paginated-data-source';
import {PaginatedDataProvider} from '../../models/pagination/paginated-data-provider';
import {ListingOptions} from '../../models/pagination/listing-options';
import {Observable, of} from 'rxjs';
import {PageData} from '../../models/pagination/page-data';

class FamilyPaginatedProvider implements PaginatedDataProvider<SpeciesAnalysis> {
  private species?: string;

  public constructor(
    private readonly family: string,
    private readonly dataService: DataService
  ) {
  }

  public getCurrentSpeciesName(): string | undefined {
    return this.species;
  }

  public changeSpecies(species?: string): void {
    this.species = species;
  }

  public list(options: ListingOptions): Observable<PageData<SpeciesAnalysis>> {
    if (this.species === undefined) {
      return of(PageData.EMPTY_PAGE);
    } else {
      return this.dataService.listFamilySpeciesAnalysis(this.family, this.species, options);
    }
  }
}

@Component({
  selector: 'slf-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss']
})
export class FamilyComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) public paginator?: MatPaginator;
  @ViewChild(MatSort) public sort?: MatSort;

  public readonly id: string;
  public readonly displayedColumns = ['species', 'name', 'actions'];

  public speciesNames?: string[];

  private _dataSource?: MatPaginatedDataSource<SpeciesAnalysis>;
  private dataProvider?: FamilyPaginatedProvider;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly dataService: DataService
  ) {
    const paramMap = this.route.snapshot.paramMap;
    if (!paramMap.has('id')) {
      this.router.navigate(['/']);
      throw new Error('Missing id');
    }
    this.id = <string>paramMap.get('id');
  }

  public ngOnInit(): void {
    this.dataProvider = new FamilyPaginatedProvider(this.id, this.dataService);
    this._dataSource = new MatPaginatedDataSource<SpeciesAnalysis>(this.dataProvider);

    this.dataService.listFamilySpecies(this.id)
      .subscribe(speciesNames => {
        this.speciesNames = speciesNames;
        this.changeSpecies(this.speciesNames[0]);
      });
  }

  public ngAfterViewInit(): void {
    this._dataSource?.setControls(this.paginator, this.sort);
  }

  public get dataSource(): MatPaginatedDataSource<SpeciesAnalysis> {
    if (this._dataSource === undefined) {
      throw new Error('dataProvider is undefined');
    }

    return this._dataSource;
  }

  public get currentSpeciesName(): string {
    if (this.dataProvider === undefined) {
      throw new Error('dataProvider is undefined');
    }

    const species = this.dataProvider.getCurrentSpeciesName();

    return species === undefined ? '' : species;
  }

  public extractResultId(speciesAnalysis: SpeciesAnalysis): string {
    const name = speciesAnalysis.name;
    return name.substring(name.lastIndexOf('/') + 1);
  }

  public onChangeSpecies(speciesName: string): void {
    this.changeSpecies(speciesName);
  }

  private changeSpecies(speciesName: string): void {
    this.dataProvider?.changeSpecies(speciesName);
    this.paginator?.firstPage();
    this.dataSource.updatePage();
  }
}
