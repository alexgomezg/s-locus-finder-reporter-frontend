import {Component, Inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'slf-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  private readonly existFirstValue: boolean;
  private readonly existSecondValue: boolean;
  public readonly firstValue:string;
  public readonly secondValue:string;

  constructor(public dialogRef: MatDialogRef<DialogComponent>,
              private router: Router,
              @Inject(MAT_DIALOG_DATA) public data: { firstValue:string,existFirstValue: boolean, secondValue:string,existSecondValue: boolean },
              private readonly snackBar: MatSnackBar) {
    this.existFirstValue = data.existFirstValue;
    this.existSecondValue = data.existSecondValue;
    this.firstValue=data.firstValue
    this.secondValue=data.secondValue

  }

  ngOnInit(): void {
  }

  public onGoToFamily(param: string): void {
    this.dialogRef.close();
    if (param !== undefined) {

      let existResult: boolean;

      if (param === this.firstValue) {
        existResult = this.existFirstValue;
      } else {
        existResult = this.existSecondValue;
      }

      if (existResult) {
        this.router.navigate(['family/', param]);
      } else {

        this.snackBar.open(`Data not found for family: ${param}`, 'Close', {
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          duration: 4000
        });

      }
    }
  }

}
