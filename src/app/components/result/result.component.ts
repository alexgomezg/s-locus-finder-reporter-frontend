import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SpeciesAnalysis} from 'src/app/models/SpeciesAnalysis';
import {DataService} from 'src/app/services/data.service';
import {SLFDatabase} from '../../models/SLFDatabase';
import {FamilyAnalysis} from '../../models/FamilyAnalysis';
import {PaginatedDataProvider} from '../../models/pagination/paginated-data-provider';
import {ListingOptions} from '../../models/pagination/listing-options';
import {Observable, of} from 'rxjs';
import {PageData} from '../../models/pagination/page-data';
import {SpeciesRow} from '../../models/SpeciesRow';
import {MatPaginatedDataSource} from '../../models/pagination/mat-paginated-data-source';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../../environments/environment';


class SpeciesPaginatedProvider implements PaginatedDataProvider<SpeciesRow> {

  private checkedAnalysis: Map<string, Map<string, boolean>>;

  public constructor(
    private readonly family: string,
    private readonly species: string,
    private readonly dataService: DataService
  ) {
    this.checkedAnalysis = new Map<string, Map<string, boolean>>();
  }

  public getCurrentSpeciesName(): string | undefined {
    return this.species;
  }


  public isChecked(analysis: SpeciesRow): boolean {
    const modelChecked = this.checkedAnalysis?.get(analysis.regionName);
    return modelChecked !== undefined && modelChecked.get(analysis.modelName) === true;
  }

  public onToggleRow(analysis: SpeciesRow): void {
    const checked = this.isChecked(analysis);
    // @ts-ignore
    this.checkedAnalysis.get(analysis.regionName).set(analysis.modelName, !checked);
  }

  public setCheckedAnalysis(): void {

    this.dataService.getSpecieResults(this.family, this.species).subscribe(rowDataArray => {
        Object.values(rowDataArray).forEach(rowData => {
          if (!this.checkedAnalysis?.has(rowData.regionName)) {
            this.checkedAnalysis?.set(rowData.regionName, new Map<string, boolean>());
          }
          // @ts-ignore
          this.checkedAnalysis.get(rowData.regionName).set(rowData.modelName, rowData.hasPredictedAnalysis());
        });
      }
    );
  }


  public list(options: ListingOptions): Observable<PageData<SpeciesRow>> {
    this.setCheckedAnalysis();
    if (this.species === undefined) {
      return of(PageData.EMPTY_PAGE);
    } else {
      return this.dataService.listSpeciesResults(this.family, this.species, options);
    }
  }
}

@Component({
  selector: 'slf-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  @ViewChild(MatPaginator) public paginator?: MatPaginator;
  @ViewChild(MatSort) public sort?: MatSort;
  public readonly id: string;
  public readonly familyName: string;
  private readonly speciesName: string;
  private database?: SLFDatabase;
  private familyAnalysis?: FamilyAnalysis;
  public speciesAnalysis?: SpeciesAnalysis;
  public speciesAnalysisNames: string[];
  public rowData: SpeciesRow[];

  private checkedAnalysis: Map<string, Map<string, boolean>>;
  private _dataSource?: MatPaginatedDataSource<SpeciesRow>;
  private dataProvider?: SpeciesPaginatedProvider;

  public readonly displayedColumns: string[] =
    ['predicted', 'region', 'model', 'min_tree_distance', 'fbox', 'isoelectric_point'];

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly snackBar: MatSnackBar,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly dataService: DataService
  ) {
    const paramMap = this.route.snapshot.paramMap;
    if (!(paramMap.has('family') && paramMap.has('id'))) {
      this.router.navigate(['/']);
      throw new Error('Missing familyName and id');
    }
    this.familyName = <string>paramMap.get('family');
    this.id = <string>paramMap.get('id');
    this.speciesName = this.id.substring(0, this.id.indexOf('_' + this.familyName));
    this.speciesAnalysisNames = [];
    this.rowData = [];
    this.checkedAnalysis = new Map<string, Map<string, boolean>>();
  }

  public ngOnInit(): void {

    this.dataProvider = new SpeciesPaginatedProvider(this.familyName, this.id, this.dataService);
    this._dataSource = new MatPaginatedDataSource<SpeciesRow>(this.dataProvider);


    this.dataService.getFamily(this.familyName)
      .subscribe(familyAnalysis => {
        this.familyAnalysis = familyAnalysis;
        this.speciesAnalysis = familyAnalysis.speciesAnalysis[this.id];
        console.log(this.speciesAnalysis);
        this.speciesAnalysisNames = Object.keys(familyAnalysis.speciesAnalysis)
          .filter(speciesName => speciesName.includes(this.speciesName));
      });
  }

  public ngAfterViewInit(): void {
    this._dataSource?.setControls(this.paginator, this.sort);
  }

  public get dataSource(): MatPaginatedDataSource<SpeciesRow> {
    if (this._dataSource === undefined) {
      throw new Error('dataProvider is undefined');
    }
    return this._dataSource;
  }

  public onChangeResults(value: string): void {
    this.router.navigate(['species', this.familyName, value])
      .then(() => window.location.reload());
  }

  public isChecked(analysis: SpeciesRow): boolean {
    return <boolean>this.dataProvider?.isChecked(analysis);
  }

  public onToggleRow(analysis: SpeciesRow): void {
    this.dataProvider?.onToggleRow(analysis);
  }

  public buildFileUrl(filePath: string): string {
    return `${environment.filesUrl}/${filePath}`;
  }
}
