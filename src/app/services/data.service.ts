import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {SLFDatabase} from '../models/SLFDatabase';
import {BehaviorSubject, filter, map, Observable, tap} from 'rxjs';
import {FamilyAnalysis} from '../models/FamilyAnalysis';
import {ListingOptions} from '../models/pagination/listing-options';
import {SpeciesAnalysis} from '../models/SpeciesAnalysis';
import {PageData} from '../models/pagination/page-data';
import {SpeciesRow} from '../models/SpeciesRow';
import {SLFDatabaseInformation} from '../models/SLFDatabaseInformation';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly database: BehaviorSubject<SLFDatabase | undefined>;

  constructor(private readonly http: HttpClient) {
    this.database = new BehaviorSubject<SLFDatabase | undefined>(undefined);
  }

  private getDatabase(): Observable<SLFDatabase> {
    return <Observable<SLFDatabase>>this.database
      .asObservable()
      .pipe(filter(value => value !== undefined));
  }

  public getDatabaseInfo(): Observable<SLFDatabaseInformation> {
    return this.getDatabase()
      .pipe(map(database => database.info));
  }

  public getNewick(): Observable<string> {
    return this.getDatabase()
      .pipe(map(database => database.newick));
  }

  public listFamilyNames(): Observable<string[]> {
    return this.getDatabase()
      .pipe(map(database => Object.keys(database.families)));
  }

  public findFamilyName(name: string): Observable<string[]> {
    name = name.toLowerCase();
    return this.listFamilyNames()
      .pipe(
        map(familyNames => familyNames.filter(familyName => familyName.toLowerCase().includes(name)))
      );
  }

  public getFamily(name: string): Observable<FamilyAnalysis> {
    return this.getDatabase()
      .pipe(
        map(database => {
          if (name in database.families) {
            return database.families[name];
          } else {
            throw new Error(`Unknown family ${name}`);
          }
        })
      );
  }

  public hasFamily(name: string): Observable<boolean> {
    return this.getDatabase()
      .pipe(
        tap(database => console.log(database)),
        tap(database => console.log(name in database.families)),
        map(database => name in database.families),
        tap(exists => console.log(exists))
      );
  }

  public getSpecieResults(familyName: string, speciesName: string): Observable<SpeciesRow[]> {
    return this.getDatabase()
      .pipe(
        map(database => {
          if (familyName in database.families) {
            let rowData: SpeciesRow[] = [];

            Object.values(database.families[familyName].speciesAnalysis[speciesName].regionAnalysis).forEach(regionAnalysis => {
              Object.values(regionAnalysis.modelAnalysis).forEach(modelAnalysis => {
                rowData.push(new SpeciesRow(regionAnalysis.name, modelAnalysis));
              });

            });
            return rowData;
          } else {
            throw new Error(`Unknown family ${familyName}`);
          }
        })
      );
  }

  public loadAnalysisResults(): void {
    if (this.database.value !== undefined) {
      throw new Error('multipleFamilyAnalysis is already initialized');
    }

    /*this.http.get<SLFDatabase>(`${environment.apiUrl}/database`)
      .subscribe(database => {
        this.database.next(database);
      });*/
    
     this.http.get<SLFDatabase>(`${environment.apiUrl}/database`,
       {headers: new HttpHeaders({'Content-Type': 'application/gzip'})}).subscribe(database => {
       this.database.next(database);
       console.log(database)
     });


  }

  public listFamilySpecies(familyName: string): Observable<string[]> {
    return this.getFamily(familyName)
      .pipe(
        map(family => Object.keys(family.speciesAnalysis)
          .map(speciesName => speciesName.substring(0, speciesName.indexOf(familyName) - 1))
          .filter((item, index, list) => list.indexOf(item) === index) // Removes duplicates
          .sort()
        )
      );
  }

  public listFamilySpeciesAnalysis(
    familyName: string, speciesName: string, options: ListingOptions
  ): Observable<PageData<SpeciesAnalysis>> {
    return this.getFamily(familyName)
      .pipe(
        map(family => Object.values(family.speciesAnalysis)
          .filter(analysis => analysis.name.startsWith(speciesName))
        ),
        map(speciesAnalysis => new PageData<SpeciesAnalysis>(
          speciesAnalysis.length,
          options.apply(speciesAnalysis, {'name': (analysis) => analysis.name})
        ))
      );
  }

  public listSpeciesResults(
    familyName: string, speciesName: string, options: ListingOptions
  ): Observable<PageData<SpeciesRow>> {
    return this.getSpecieResults(familyName, speciesName)
      .pipe(
        map(rowData => new PageData<SpeciesRow>(
          rowData.length,
          options.apply(rowData, {
            'model': (analysis) => analysis.modelName,
            'region': (analysis) => analysis.regionName
          })
        ))
      );
  }
}
