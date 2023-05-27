import { Component, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Sprite, Runner, Obstacle } from '../services/sprite.model';
import { SpriteService } from '../services/sprite.service';
import { isSubscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class HomePage implements AfterViewInit {
  @ViewChild ('container', { static: true}) containerRef!: ElementRef;
  @ViewChild('gameCanvas', { static: true }) gameCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('progressBar', { static: true }) progressBarRef!: ElementRef;

  // View Elements
  private container!: HTMLDivElement;
  private progressBar!: HTMLCanvasElement;
  private gameCanvas!: HTMLCanvasElement;
  private progressContext!: CanvasRenderingContext2D;
  private gameContext!: CanvasRenderingContext2D;
  // Images for View Elements
  private progressBackground!: HTMLImageElement;
  private gameBackgroundImage!: HTMLImageElement;
  private runnerImage!: HTMLImageElement;
  private garbageBagImage!: HTMLImageElement;
  private goldCoinImage!: HTMLImageElement;
  private boneImage!: HTMLImageElement;
  // Sprite Objects 
  private frame: number = 0;
  private spriteRunner!: Runner;
  private spritesGarbageBag: Obstacle[] = [];
  private spritesGoldCoin: Obstacle[] = [];
  private spritesBone: Obstacle[] = [];
  //
  private gameLoop!: any;
  public score: number = 0;
  private setUp: any = {
    'garbageBag': {
      'src': 'assets/GarbageBags.png',
      'quantity': 3,
      'speed': -10,
    },
    'goldCoin': {
      'src': 'assets/GoldCoin.png',
      'quantity': 5,
      'speed': -15,
    },
    'doggieBone': {
      'src': 'assets/DoggieBone.png',
      'quantity': 10,
      'speed': -5
    }
  }
  // Test Macbook
  private isDragging: boolean = false;
    
  constructor(public spriteService: SpriteService) {}

  ngAfterViewInit(): void {
    this.container = this.containerRef.nativeElement;
    console.log(this.container);
    this.progressBar = this.gameCanvasRef.nativeElement;
    this.gameCanvas = this.gameCanvasRef.nativeElement;
    console.log(this.gameCanvas)

    // Render the game canvas background
    if (this.gameCanvas instanceof HTMLCanvasElement) {
      this.gameContext = this.gameCanvas.getContext('2d') as CanvasRenderingContext2D;
  
      if (this.gameContext) {
        // Render canvas
        this.gameBackgroundImage = new Image();
        this.gameBackgroundImage.src = 'assets/GameBackground.png';
        this.gameBackgroundImage.onload = () => {
          this.gameCanvas.width = this.gameBackgroundImage.width;
          this.gameCanvas.height = this.gameBackgroundImage.height;
          this.gameContext.drawImage(this.gameBackgroundImage, 0, 0);
        };

        this.gameCanvas.addEventListener('mousedown', (event: MouseEvent) => {
          this.isDragging = true;
        });

        this.gameCanvas.addEventListener('mousemove', (event:MouseEvent)=>  {
          if (!this.isDragging) return;
          const canvasRect = this.gameCanvas.getBoundingClientRect();
          this.spriteRunner.y = event.clientY -  canvasRect.top;
        });

        this.gameCanvas.addEventListener('mouseup', (event: MouseEvent) => {
          this.isDragging = false;
        });

        // Set up and launch
        this.start_game();
        
      } else {
        console.error('Failed to get 2D rendering context for canvas');
      }
    } else {
      console.error('Canvas element not found');
    } 

  }

  // game_loop
  public game_loop = () => {
    // Step through the frames
    this.gameLoop = setInterval(() => {
      // Clear canvas
      this.gameContext.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

      // Render background
      this.gameContext.drawImage(this.gameBackgroundImage, 0, 0);

      // Render runner and sprites
      this.spriteRunner.draw(this.gameContext);

      this.spritesGarbageBag.forEach((spriteGarbageBag) => {
        if (spriteGarbageBag.isAtEdge) {
          spriteGarbageBag.setPosition_reset(this.gameCanvas.width, this.gameCanvas.height);
        }
        spriteGarbageBag.setPosition_advanceOneStep();
        spriteGarbageBag.draw(this.gameContext);
      })
      this.spritesGoldCoin.forEach((spriteGoldCoin) => {
        if (spriteGoldCoin.isAtEdge) {
          spriteGoldCoin.setPosition_reset(this.gameCanvas.width, this.gameCanvas.height);
        }
        spriteGoldCoin.setPosition_advanceOneStep();
        spriteGoldCoin.draw(this.gameContext);
      })

      // Detect collision and handle the event
      this.detectCollisions_wRunner();

      // Detect sprite at canvas edge and handle the event

    }, 200);
    return;

  }

  async start_game() {
    // Set up and launch
    this.spriteRunner = await this.spriteService.getRunner('assets/RunnerGuy.png');
    this.spriteRunner.setPosition_initial(this.gameCanvas.width, this.gameCanvas.height);
    this.spriteRunner.draw(this.gameContext);

    let k = 'garbageBag';
    this.spritesGarbageBag = await this.spriteService.getObstacleSprites(this.setUp[k].quantity, k, this.setUp[k].src);
    this.spritesGarbageBag.forEach((spriteGarbageBag) => {
      spriteGarbageBag.setPosition_initial(this.gameCanvas.width, this.gameCanvas.height);
      spriteGarbageBag.draw(this.gameContext);
    })
    k = 'goldCoin';
    this.spritesGoldCoin = await this.spriteService.getObstacleSprites(this.setUp[k].quantity, k, this.setUp[k].src);
    this.spritesGoldCoin.forEach((spriteGoldCoin) => {
      spriteGoldCoin.setPosition_initial(this.gameCanvas.width, this.gameCanvas.height);
      spriteGoldCoin.draw(this.gameContext);

    })
    this.game_loop();
  }

  stop_game() {
    return;
  }

  detectCollisions_wRunner() {
    this.spritesGarbageBag.forEach((sprite) => {
      if (this.isCollision(this.spriteRunner, sprite)) {
        sprite.setPosition_reset(this.gameCanvas.width, this.gameCanvas.height);
        console.log("OUCH!!");
      }   // end IF
    })    // end FOR
    this.spritesGoldCoin.forEach((sprite) => {
      if (this.isCollision(this.spriteRunner, sprite)) {
        sprite.setPosition_reset(this.gameCanvas.width, this.gameCanvas.height);
        console.log("Huzzah!")
      }
    })
  }

  isCollision(a_sprite: Sprite, b_sprite: Sprite): boolean {
    return (
      a_sprite.x < b_sprite.x + b_sprite.width &&
      a_sprite.x + a_sprite.width > b_sprite.x &&
      a_sprite.y < b_sprite.y + b_sprite.height &&
      a_sprite.y + a_sprite.height > b_sprite.y
    );
  }
}
