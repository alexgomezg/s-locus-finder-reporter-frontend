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
import {SortDirection} from './sort-direction.enum';

export class ListingOptions {
  public constructor(
    public readonly pageIndex: number,
    public readonly pageSize: number,
    public readonly sortFields?: { field: string, order: SortDirection }[],
    public readonly filters?: { [key: string]: string }
  ) {
  }

  public get initialIndex(): number {
    return this.pageIndex * this.pageSize;
  }

  public get finalIndex(): number {
    return (this.pageIndex + 1) * this.pageSize - 1;
  }

  public hasOrder(): boolean {
    return this.sortFields !== undefined && this.sortFields.length > 0;
  }

  public hasFilters(): boolean {
    return this.filters !== undefined && Object.keys(this.filters).length > 0;
  }

  public apply<T>(values: T[], mappers: { [key: string]: (value: T) => string }): T[] {
    return values
      .filter(value => this.matchesFilters(value, mappers))
      .sort((a: T, b: T) => this.compareValues(a, b, mappers))
      .slice(this.initialIndex, this.finalIndex + 1);
  }

  private matchesFilters<T>(value: T, mappers: { [key: string]: (value: T) => string }): boolean {
    if (!this.hasFilters()) {
      return true;
    }

    // @ts-ignore
    for (const [field, filter] of Object.entries(this.filters)) {
      const fieldValue = mappers[field](value);

      if (!fieldValue.includes(filter)) {
        return false;
      }
    }

    return true;
  }

  private compareValues<T>(a: T, b: T, mappers: { [p: string]: (value: T) => string }): number {
    if (this.hasOrder()) {
      // @ts-ignore
      for (const order of this.sortFields) {
        if (order.order === SortDirection.NONE) {
          continue;
        }

        const valueA = mappers[order.field](a);
        const valueB = mappers[order.field](b);

        const cmp = valueA.localeCompare(valueB);
        if (cmp !== 0) {
          return order.order === SortDirection.ASCENDING ? cmp : -cmp;
        }
      }
    }

    return 0;
  }
}
