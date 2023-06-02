import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { SharedDataService } from '../services/shared-data.service';

@Component({
  selector: 'app-runner-selection',
  templateUrl: './runner-selection.page.html',
  styleUrls: ['./runner-selection.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RunnerSelectionPage implements OnInit {

  constructor(public sharedData: SharedDataService, public navController: NavController) { }

  ngOnInit() {
  }

  public selectRunner(runner: string) {
    this.sharedData.setAttribute('runner', runner);
    console.log("Blonde moment here!");
    this.navController.navigateForward('/home');
  }
}

