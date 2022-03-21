import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {
  
  public static CRIME_VIOLENCE = 'Violence Against the Person';
  public static CRIME_TYPES = ['Burglary', 'Criminal Damage', 'Drugs', 'Fraud or Forgery', 'Other Notifiable Offences', 'Robbery', 'Sexual Offences', 'Theft and Handling', 'Violence Against the Person'];
  public static SCALE_LINEAR = "Linear";
  public static SCALE_SQRT = "Square Root";
  public static SCALE_LOG = "Log";
  public static SCALES = [ConstantsService.SCALE_LINEAR, ConstantsService.SCALE_SQRT, ConstantsService.SCALE_LOG];;

  constructor() {
   }
}
