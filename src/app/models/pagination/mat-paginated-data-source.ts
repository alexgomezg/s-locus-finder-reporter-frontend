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
import {PaginatedDataSource} from './paginated-data-source';
import {PaginatedDataProvider} from './paginated-data-provider';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {Subscription} from 'rxjs/internal/Subscription';
import {ListingOptions} from './listing-options';
import {SortDirection} from './sort-direction.enum';
import {Observable} from 'rxjs/internal/Observable';

export class MatPaginatedDataSource<T> extends PaginatedDataSource<T> {
  public static readonly DEFAULT_PAGE_SIZE = 10;

  private pageIndex: number;
  private pageSize: number;
  private sortFields?: { field: string, order: SortDirection }[];
  private filters: { [key: string]: string };

  private _paginator?: MatPaginator;
  private _sort?: MatSort;
  private _filterFields: { [key: string]: Observable<string> };

  private paginatorSubscription?: Subscription;
  private sortSubscription?: Subscription;
  private filterFieldsSubscriptions: { [key: string]: Subscription };

  public constructor(
    dataProvider: PaginatedDataProvider<T>,
    private readonly defaultPageSize = MatPaginatedDataSource.DEFAULT_PAGE_SIZE
  ) {
    super(dataProvider);
    this.pageIndex = 0;
    this.pageSize = defaultPageSize;
    this.sortFields = undefined;
    this.filters = {};
    this._filterFields = {};
    this.filterFieldsSubscriptions = {};
  }

  public get paginator(): MatPaginator | undefined {
    return this._paginator;
  }

  public set paginator(paginator: MatPaginator | undefined) {
    this.setControls(paginator, this._sort, this._filterFields);
  }

  public get sort(): MatSort | undefined {
    return this._sort;
  }

  public set sort(sort: MatSort | undefined) {
    this.setControls(this._paginator, sort, this._filterFields);
  }

  public set filterFields(
    filterFields: { [key: string]: Observable<string> } | undefined
  ) {
    this.setControls(this._paginator, this._sort, filterFields, undefined);
  }

  public get filterFields(): { [key: string]: Observable<string> } {
    return this._filterFields;
  }

  public setControls(
    paginator: MatPaginator | undefined = undefined,
    sort: MatSort | undefined = undefined,
    filterFields: { [key: string]: Observable<string> } | undefined = undefined,
    filterValues: { [key: string]: string } | undefined = undefined
  ) {
    let triggerUpdate = false;

    if (this._paginator !== paginator) {
      triggerUpdate = true;
      if (this.hasPaginator()) {
        // @ts-ignore
        this.paginatorSubscription.unsubscribe();
        this.paginatorSubscription = undefined;
      }

      this._paginator = paginator;
      if (this.hasPaginator()) {
        // @ts-ignore
        this.pageIndex = this._paginator.pageIndex;
        // @ts-ignore
        this.pageSize = this._paginator.pageSize;

        // @ts-ignore
        this.paginatorSubscription = this._paginator.page.subscribe(
          event => this.onPageEvent(event)
        );
      } else {
        this.pageIndex = 0;
        this.pageSize = this.defaultPageSize;
      }
    }

    if (this._sort !== sort) {
      triggerUpdate = true;
      if (this.hasSort()) {
        // @ts-ignore
        this.sortSubscription.unsubscribe();
        this.sortSubscription = undefined;
      }

      this._sort = sort;

      if (this.hasSort()) {
        // @ts-ignore
        if (this._sort.active) {
          this.sortFields = [{
            // @ts-ignore
            field: this._sort.active,
            // @ts-ignore
            order: SortDirection.from(this._sort.direction)
          }];
        } else {
          this.sortFields = undefined;
        }

        // @ts-ignore
        this.sortSubscription = this._sort.sortChange.subscribe(
          event => this.onSortChange(event)
        );
      } else {
        this.sortFields = undefined;
      }
    }

    filterFields = filterFields === undefined ? {} : filterFields;
    if (this._filterFields !== filterFields) {
      triggerUpdate = true;
      if (this.hasFilters()) {
        for (const filterName of Object.keys(this.filterFieldsSubscriptions)) {
          this.filterFieldsSubscriptions[filterName].unsubscribe();
        }
        this.filterFieldsSubscriptions = {};
      }

      this._filterFields = filterFields;
      this.filters = filterValues === undefined ? {} : filterValues;
      if (this.hasFilters()) {
        for (const filterName of Object.keys(this._filterFields)) {
          this.filterFieldsSubscriptions[filterName] = this._filterFields[filterName].subscribe(
            value => this.onFilterChange(filterName, value)
          );
        }
      }
    }

    if (triggerUpdate) {
      this.update(this.buildListingOptions());
    }
  }

  public hasPaginator(): boolean {
    return this._paginator !== undefined;
  }

  public hasSort(): boolean {
    return this._sort !== undefined;
  }

  private hasFilters() {
    return Object.keys(this._filterFields).length > 0;
  }

  private onPageEvent(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this.update(this.buildListingOptions());
  }

  private onSortChange(sort: Sort) {
    if (this.hasPaginator()) {
      this.pageIndex = 0;
      // @ts-ignore
      this._paginator.pageIndex = 0;
    }

    const sortDirection = SortDirection.from(sort.direction);
    if (sort.active === undefined || sortDirection === SortDirection.NONE) {
      this.sortFields = undefined;
    } else {
      this.sortFields = [{
        // @ts-ignore
        field: this._sort.active,
        // @ts-ignore
        order: SortDirection.from(this._sort.direction)
      }];
    }

    this.update(this.buildListingOptions());
  }

  private onFilterChange(filterName: string, value: string) {
    if (this.hasPaginator()) {
      this.pageIndex = 0;
      // @ts-ignore
      this._paginator.pageIndex = 0;
    }

    if (value === '') {
      delete this.filters[filterName];
    } else {
      this.filters[filterName] = value;
    }

    this.update(this.buildListingOptions());
  }

  public updatePage() {
    this.update(this.buildListingOptions());
  }

  private buildListingOptions(): ListingOptions {
    return new ListingOptions(
      this.pageIndex,
      this.pageSize,
      this.sortFields,
      this.filters
    );
  }
}
