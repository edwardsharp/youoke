import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppToolbarService {

	public toolbarHidden = new Subject<boolean>();

  constructor() { }

  toggleHidden(hidden: boolean): void {
    this.toolbarHidden.next(hidden);
  }

}
