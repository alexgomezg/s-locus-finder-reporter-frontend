import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import PhylocanvasGL, {TreeTypes} from '@phylocanvas/phylocanvas.gl';
import {Router} from '@angular/router';
import {DataService} from 'src/app/services/data.service';
import {MatDialog} from '@angular/material/dialog';
import {DialogComponent} from '../dialog/dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {forkJoin, map, take} from 'rxjs';

@Component({
  selector: 'slf-families-tree',
  templateUrl: './families-tree.component.html',
  styleUrls: ['./families-tree.component.scss']
})
export class FamiliesTreeComponent implements AfterViewInit {
  @ViewChild('demo') demoDiv!: ElementRef<HTMLDivElement>;
  private tree: PhylocanvasGL;
  public databaseDescription?: string;

  constructor(
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly dataService: DataService
  ) {
  }


  public ngAfterViewInit(): void {
    forkJoin({
      newick: this.dataService.getNewick().pipe(take(1)),
      style: this.dataService.listFamilyNames()
        .pipe(
          take(1),
          map(familyNames => familyNames.reduce((styles, family) => {
            styles[family] = {fillColour: 'red'};
            return styles;
          }, {}))
        )
    }).subscribe(newickAndStyles => {
      this.renderizeTree(newickAndStyles.newick, newickAndStyles.style);
    });


    this.dataService.getDatabaseInfo()
      .subscribe(info => {
        this.databaseDescription=info.description
      });

  }

  private renderizeTree(newickTree: string, styles: { [key: string]: { fillColour: string } }): void {
    const screenSize = this.demoDiv.nativeElement.getBoundingClientRect();
    screenSize.width = screenSize.width * 0.95;
    screenSize.height = screenSize.height * 3;

    this.tree = new PhylocanvasGL(
      this.demoDiv.nativeElement,
      {
        interactive: false,
        showLabels: true,
        showLeafLabels: true,
        size: screenSize,
        alignLabels: true,
        nodeSize: 16,
        fillColour: '#3f51b5',
        source: newickTree,
        type: TreeTypes.Rectangular,
        styles: styles,
        styleLeafLabels: true
      }
    );

    this.tree.setProps({
      interactive: true
    });
  }

  public onGoToFamily(): void {
    const param = this.tree['props']['selectedIds'];
    if (param !== undefined) {
      const familyId = param[0];
      let idMultipleValues=familyId.split(/(?=[A-Z])/);
      if (idMultipleValues.length > 1) {
        forkJoin(
          {
            // take(1) is needed as forkJoin requires the observable to complete
            firstValue: this.dataService.hasFamily(idMultipleValues[0]).pipe(take(1)),
            secondValue: this.dataService.hasFamily(idMultipleValues[1]).pipe(take(1))
          }
        ).subscribe(familiesPresence => {
          this.onOpenDialog(idMultipleValues[0],familiesPresence['firstValue'],idMultipleValues[1],familiesPresence['secondValue']);
        });
      } else {
        this.dataService.hasFamily(familyId)
          .subscribe(hasFamily => {
            if (hasFamily) {
              this.router.navigate(['family', familyId]);
            } else {
              this.snackBar.open(`Data not found for family: ${param}`, 'Close', {
                horizontalPosition: 'end',
                verticalPosition: 'bottom',
                duration: 4000
              });
            }
          });
      }
    }
  }

  private onOpenDialog(firstValue:string,existFirstValue: boolean,secondValue:string, existSecondValue: boolean): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px',
      data: {'firstValue':firstValue,'existFirstValue':existFirstValue,'secondValue':secondValue, 'existSecondValue': existSecondValue}
    });
  }
}
