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
export enum SortDirection {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
  NONE = 'NONE'
}

export namespace SortDirection {
  export function from(sort: string): SortDirection {
    if (sort.trim().length === 0) {
      return SortDirection.NONE;
    }

    const sortRegExp = new RegExp('^' + sort, 'i');

    for (const value of Object.keys(SortDirection)) {
      if (sortRegExp.test(value)) {
        return SortDirection[value];
      }
    }

    return SortDirection.NONE;
  }
}
