import { Component, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Sprite, Runner, Obstacle, ProRunner, ProDogs } from '../services/sprite.model';
import { SpriteService } from '../services/sprite.service';

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
  @ViewChild('progressBar', { static: true }) progressBarRef!: ElementRef<HTMLCanvasElement>;

  // View Elements
  private container!: HTMLDivElement;
  private progressBar!: HTMLCanvasElement;
  private gameCanvas!: HTMLCanvasElement;
  private progressContext!: CanvasRenderingContext2D;
  private gameContext!: CanvasRenderingContext2D;
  // Images for View Elements
  private progressBackgroundImage!: HTMLImageElement;
  private gameBackgroundImage!: HTMLImageElement;
  // Sprite Objects 
  private spriteRunner!: Runner;
  private spritesGarbageBag: Obstacle[] = [];
  private spritesGoldCoin: Obstacle[] = [];
  private spritesBone: Obstacle[] = [];
  private spriteProRunner!: ProRunner;
  private spriteProDogs!: ProDogs;
  //
  private gameLoop!: any;
  private progressLoop!: any;
  private loopInterval: number = 150;
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
    },
    'proRunner': {
      'src': 'assets/RunnerGuyMini.png',
      'speed': 5
    },
    'proDogs': {
      'src': 'assets/Dogs.png',
      'speed': 5,
    }
  }
  // Test Macbook
  private isDragging: boolean = false;
    
  constructor(public spriteService: SpriteService) {}

  ngAfterViewInit(): void {
    this.container = this.containerRef.nativeElement;
    console.log(this.container);
    this.progressBar = this.progressBarRef.nativeElement;
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
        }; // end onload

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

        if (this.progressBar instanceof(HTMLCanvasElement)) {
          this.progressContext = this.progressBar.getContext('2d') as CanvasRenderingContext2D;

          if (this.progressContext) {
            this.progressBackgroundImage = new Image();
            this.progressBackgroundImage.src = "assets/RunningBar_Background.png";
            this.progressBackgroundImage.onload = () => {
              this.progressBar.width =  this.progressBackgroundImage.width;
              this.progressBar.height = this.progressBackgroundImage.height;
              this.progressContext.drawImage(this.progressBackgroundImage, 0, 0)
            };

             // Set up and launch
            this.start_game();
          } else {
            console.error("GOT NO 2D RENDERING CONTEXT FOR PROGRESS BAR!")
          }
        } else {
          console.error("FOUND NO CANVAS ELEMENT FOR PROGRESS BAR!")
        }      
      } else {
        console.error('GOT NO 2D RENDERING CONTEXT FOR MAIN CANVAS!');
      }
    } else {
      console.error('FOUND NO CANVAS ELEMENT FOR GAME!');
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

      // Render runner and sprites after updating position 
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
      this.spritesBone.forEach((spriteBone) => {
        if (spriteBone.isAtEdge) {
          spriteBone.setPosition_reset(this.gameCanvas.width, this.gameCanvas.height);
        }
        spriteBone.setPosition_advanceOneStep();
        spriteBone.draw(this.gameContext);
      })

      // Detect collision and handle the event
      this.detectCollisions_wRunner();

      // Detect sprite at canvas edge and handle the event

    }, this.loopInterval);
    return;

  }

  public progress_loop() {
    this.progressLoop = setInterval(() => {
      // Clear canvas
      this.progressContext.clearRect(0, 0, this.progressBar.width, this.progressBar.height);

      // Render canvas
      this.progressContext.drawImage(this.progressBackgroundImage, 0, 0);

      // Render runner and dogs
      this.spriteProDogs.setPosition_advanceOneStep();
      this.spriteProRunner.setPosition_advanceOneStep();
      this.spriteProDogs.draw(this.progressContext);
      this.spriteProRunner.draw(this.progressContext);

    }, this.loopInterval*10);

  }

  async start_game() {
    /* 
    Set up and launch

    For main canvas, proceed as follows:
    1. Obtain sprites using the service
    2. Initialize each sprite's starting position
    3. Render on main canvas

    For progress bar, proceed as follows:
    1. Obtain the sprites using the service
    2. Initialize each sprite's starting position
    3. Render on canvas for progress bar
    */

    // Obtain runner and render at starting position
    this.spriteRunner = await this.spriteService.getRunner('assets/RunnerGuy.png');
    this.spriteRunner.setPosition_initial(this.gameCanvas.width, this.gameCanvas.height);
    this.spriteRunner.draw(this.gameContext);
    // Obtain obstacles and render at their starting positions
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
    k = 'doggieBone';
    this.spritesBone = await this.spriteService.getObstacleSprites(this.setUp[k].quantity, k, this.setUp[k].src);
    this.spritesBone.forEach((spriteBone) => {
      spriteBone.setPosition_initial(this.gameCanvas.width, this.gameCanvas.height);
      spriteBone.draw(this.gameContext);
    })
    // Obtain sprites for progress bar and render at their starting positions
    k = 'proRunner';
    this.spriteProRunner = await this.spriteService.getProRunner(this.setUp[k].src);
    this.spriteProRunner.setPosition_initial(this.progressBar.width, this.progressBar.height);
    this.spriteProRunner.draw(this.progressContext);
    k = 'proDogs';
    this.spriteProDogs = await this.spriteService.getProDogs(this.setUp[k].src);
    this.spriteProDogs.setPosition_initial(this.progressBar.width, this.progressBar.height);
    this.spriteProDogs.draw(this.progressContext);

    this.game_loop();
    this.progress_loop();
  }

  stop_game() {
    return;
  }

  detectCollisions_wRunner() { // advance score and penalize dogs
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
      }   // end IF
    })    // end FOR
    this.spritesBone.forEach((sprite) => {
      if (this.isCollision(this.spriteRunner, sprite)) {
        sprite.setPosition_reset(this.gameCanvas.width, this.gameCanvas.height);
        console.log("Huzzah!")
      }   // end IF
    })    // end FOR
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
