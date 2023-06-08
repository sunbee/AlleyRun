import { Component, ElementRef, ViewChild, AfterViewInit, OnInit} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Sprite, Runner, Obstacle, ProRunner, ProDogs } from '../services/sprite.model';
import { SpriteService } from '../services/sprite.service';
import { Router } from '@angular/router';
import { SharedDataService } from '../services/shared-data.service';
import { Motion, AccelListenerEvent } from '@capacitor/motion';

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
  private loopInterval: number = 50;
  public message: string = "Press START!";
  public score: number = 0;
  public xyz: string = 'x?, y?, z?';
  private setUp: any = {
    'garbageBag': {
      'src': 'assets/GarbageBags.png',
      'quantity': 7,
      'speed': -10,
    },
    'goldCoin': {
      'src': 'assets/GoldCoin.png',
      'quantity': 5,
      'speed': -15,
    },
    'doggieBone': {
      'src': 'assets/DoggieBone.png',
      'quantity': 6,
      'speed': -5
    },
    'runner': {
      'src': 'assets/RunnerGuy.png'
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
    
  constructor(public sharedData: SharedDataService, public spriteService: SpriteService, public router: Router) {}

  ngOnInit(): void {
    const selected_runner = this.sharedData.getAttribute('runner');
    if (selected_runner && selected_runner === 'chick') {
      this.setUp.proRunner.src = 'assets/RunnerBlondeMini.png';
      this.setUp.runner.src = 'assets/RunnerBlonde.png';
      console.log("Blond Chickz Rule! ;)");
    }
  }
  
  async ngAfterViewInit(): Promise<void> {
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

        // Render runner
        // Obtain runner and render at starting position
        let k = '';
        k = 'runner';
        this.spriteRunner = await this.spriteService.getRunner(this.setUp[k].src);
        this.spriteRunner.setPosition_initial(this.gameCanvas.width, this.gameCanvas.height);
        this.spriteRunner.draw(this.gameContext);

        Motion.addListener('accel', (event: AccelListenerEvent) => {
          const acceleration = event.acceleration;
          console.log('Acceleration:', acceleration.y);
          this.spriteRunner.y += acceleration.y * 20;
          this.xyz = 'x' + acceleration.x + ', y' + acceleration.y + ', z' + acceleration.z;
        });

        this.gameCanvas.addEventListener('mousedown', (event: MouseEvent) => {
          this.isDragging = true;
        }); // end event-handler mouseDn

        this.gameCanvas.addEventListener('mousemove', (event:MouseEvent)=>  {
          if (!this.isDragging) return;
          const canvasRect = this.gameCanvas.getBoundingClientRect();
          this.spriteRunner.y = event.clientY -  canvasRect.top;
        }); // end event-handler mouseMv

        this.gameCanvas.addEventListener('mouseup', (event: MouseEvent) => {
          this.isDragging = false;
        }); // end event-handler mouseUp

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
          } else {
            console.error("GOT NO 2D RENDERING CONTEXT FOR PROGRESS BAR!")
          } // end if-else progress-bar's context
        } else {
          console.error("FOUND NO CANVAS ELEMENT FOR PROGRESS BAR!")
        } // end if-else progress-bar element
      } else {
        console.error('GOT NO 2D RENDERING CONTEXT FOR MAIN CANVAS!');
      } // end if-else canvas context
    } else {
      console.error('FOUND NO CANVAS ELEMENT FOR GAME!');
    } // end if-else canvas element

  } // end ngAfterViewInit interface

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

      // Detect collision and handle the event.
      /*
        Events we need to handle include:
        1. The runner collides with an obstacle and earns reward/penalty.
        2. An obstacle sprite reaches the left edge of canvas and reappears from the right edge.
        3. In the progress bar, dogs catch up with the runner and game ends in failure.
        4. In the progress bar, runner crosses the rubicon and wins.
        Futher, the runner is controlled by mouse / sensor.

        The event-handler strategy is different depending on the case. For example, the runner
        is controlled by listening for the mouse touch up/down/move events. These handlers are
        set-up in ngAfterViewInit() method.
        
        Collisions between runner-obstacles are handled by a detectCollisions_wRunner() method.
        This method of home component is invoked in each iteration of the game loop.
        
        The sprite class checks for edge-reached condition at each position update. This method
        of sprite is invoked in each iteration of the game loop.

        Collisions in progress bar are handled by isCollision() method w true/false result.
        This method of home component is invoked in each iteration of the progress bar's loop.

        The isCollision() method checks for collision between any two sprites.
      */
      this.detectCollisions_wRunner();

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
      this.spriteProDogs.setPosition_advanceOneStep(this.progressBar.width, this.progressBar.height);
      this.spriteProRunner.setPosition_advanceOneStep(this.progressBar.width, this.progressBar.height);
      this.spriteProDogs.draw(this.progressContext);
      this.spriteProRunner.draw(this.progressContext);

      // End conditions
      if (this.spriteProRunner.isAtEdge) {
        this.message = "YOU WON!!";
        this.stop_game();
      } else if (this.isCollision(this.spriteProRunner, this.spriteProDogs)) {
        this.message = "YOU DIDN'T MAKE IT!!";
        this.stop_game();
      }
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
    // Initialize
    if (this.gameLoop) clearInterval(this.gameLoop);
    if (this.progressLoop) clearInterval (this.progressLoop);
    this.score = 0;
    this.message = "Press START!";

    // Runner is already there
    let k = '';

    // Obtain obstacles and render at their starting positions
    k = 'garbageBag';
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
    clearInterval(this.gameLoop);
    clearInterval(this.progressLoop);
    return;
  }

  detectCollisions_wRunner() { // detect runner's collisions and reward or penalize
    this.spritesGarbageBag.forEach((sprite) => {
      if (this.isCollision(this.spriteRunner, sprite)) {
        this.message = "OUCH!!";
        sprite.setPosition_reset(this.gameCanvas.width, this.gameCanvas.height);
        this.spriteProRunner.penalize();
      }   // end IF
    })    // end FOR
    this.spritesGoldCoin.forEach((sprite) => {
      if (this.isCollision(this.spriteRunner, sprite)) {
        this.message = "HUZZAH!";
        sprite.setPosition_reset(this.gameCanvas.width, this.gameCanvas.height);
        this.score += 25;
      }   // end IF
    })    // end FOR
    this.spritesBone.forEach((sprite) => {      
      if (this.isCollision(this.spriteRunner, sprite)) {
        this.message = "DOGGONE!";
        sprite.setPosition_reset(this.gameCanvas.width, this.gameCanvas.height);
        this.spriteProDogs.penalize();
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





