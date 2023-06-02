import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  public stash: Stash = {};

  getAttribute(key: string): any {
    return this.stash[key];
  }

  setAttribute(key: string, value: any): void {
    this.stash[key] = value;
  }
}

export class Stash {
  [key: string]: any;
}