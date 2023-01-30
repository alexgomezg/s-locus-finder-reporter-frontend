/*
 *  EvoPPI Frontend
 *
 *  Copyright (C) 2017-2021 - Noé Vázquez González,
 *  Miguel Reboiro-Jato, Jorge Vieira, Hugo López-Fernández,
 *  and Cristina Vieira.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {catchError, finalize} from 'rxjs/operators';
import {PaginatedDataProvider} from './paginated-data-provider';
import {PageData} from './page-data';
import {ListingOptions} from './listing-options';

export class PaginatedDataSource<T> extends DataSource<T> {
  private static readonly EMPTY_DATA = [];

  public readonly initialized$: Observable<boolean>;
  public readonly data$: Observable<T[]>;
  public readonly hasData$: Observable<boolean>;
  public readonly count$: Observable<number>;
  public readonly loading$: Observable<boolean>;

  private readonly initializedSubject: BehaviorSubject<boolean>;
  private readonly dataSubject: BehaviorSubject<T[]>;
  private readonly hasDataSubject: BehaviorSubject<boolean>;
  private readonly countSubject: BehaviorSubject<number>;
  private readonly loadingSubject: BehaviorSubject<boolean>;

  private readonly dataProvider: PaginatedDataProvider<T>;

  public constructor(dataProvider: PaginatedDataProvider<T>) {
    super();

    this.dataProvider = dataProvider;

    this.initializedSubject = new BehaviorSubject<boolean>(false);
    this.dataSubject = new BehaviorSubject<T[]>(PaginatedDataSource.EMPTY_DATA);
    this.hasDataSubject = new BehaviorSubject<boolean>(false);
    this.countSubject = new BehaviorSubject<number>(0);
    this.loadingSubject = new BehaviorSubject<boolean>(false);

    this.initialized$ = this.initializedSubject.asObservable();
    this.data$ = this.dataSubject.asObservable();
    this.hasData$ = this.hasDataSubject.asObservable();
    this.count$ = this.countSubject.asObservable();
    this.loading$ = this.loadingSubject.asObservable();

    const initializationSubscription = this.dataSubject.subscribe(value => {
      if (value !== PaginatedDataSource.EMPTY_DATA) {
        this.initializedSubject.next(true);
        initializationSubscription.unsubscribe();
      }
    });
  }

  public connect(collectionViewer: CollectionViewer): Observable<T[]> {
    return this.dataSubject.asObservable();
  }

  public disconnect(collectionViewer: CollectionViewer): void {
    this.initializedSubject.complete();
    this.dataSubject.complete();
    this.hasDataSubject.complete();
    this.countSubject.complete();
    this.loadingSubject.complete();
  }

  public update(listingOptions: ListingOptions): void {
    this.loadingSubject.next(true);

    const subscription = this.dataProvider.list(listingOptions)
      .pipe(
        catchError(() => of(PageData.EMPTY_PAGE)),
        finalize(() => {
          this.loadingSubject.next(false);
          subscription.unsubscribe();
        })
      )
      .subscribe((partial: PageData<T>) => {
        this.dataSubject.next(partial.result);
        this.countSubject.next(partial.count);

        const hasData = partial.result.length > 0;
        if (hasData !== this.hasDataSubject.getValue()) {
          this.hasDataSubject.next(hasData);
        }
      });
  }
}
