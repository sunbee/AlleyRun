export class Sprite {
    public image: HTMLImageElement;
    public width: number;
    public height: number;
    public x: number;
    public y: number;

    constructor(sprite_image: HTMLImageElement, sprite_width: number, sprite_height: number) {
        this.image = sprite_image;
        this.width = sprite_width;
        this.height = sprite_height;
        this.x = 0; // Initial X-coordinate of the mole's position on the canvas
        this.y = 0; // Initial Y-coordinate of the mole's position on the canvas
    }

    public setPosition_initial(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = Math.random() * (canvasHeight - this.height);
    }

    public draw(context: CanvasRenderingContext2D) {
        context.drawImage(
            this.image,
            0,
            0,
            this.width,
            this.height,
            this.x,
            this.y,
            this.width,
            this.height
        );
      }
    
    public isMouseOver(x: number, y: number): boolean {
        return (
            x >= this.x &&
            x <= this.x + this.width &&
            y >= this.y &&
            y <= this.y + this.height
        );
      }
    
    public isTouchOver(x: number, y: number): boolean {
        return (
            x >= this.x &&
            x <= this.x + this.width &&
            y >= this.y &&
            y <= this.y + this.height
        );
    }
    
    public speak() {
        const audio = new Audio('assets/moleSquashed.mp3');
        audio.play();  
      }
  
}

export class Runner extends Sprite {
    constructor(sprite_image: HTMLImageElement, sprite_width: number, sprite_height: number) {
        super(sprite_image, sprite_width, sprite_height);
    }
    
    override setPosition_initial(canvasWidth: number, canvasHeight: number) {
        this.x = 0;
        this.y = Math.random() * (canvasHeight - this.height);
    }
}

export class Obstacle extends Sprite {
    public sprite_type: string = '';
    public reward: number = 10;
    public speed: number = -5;
    public isAtEdge: boolean = false;

    constructor(sprite_image: HTMLImageElement, sprite_width: number, sprite_height: number, sprite_type: string) {
        super(sprite_image, sprite_width, sprite_height);
        this.sprite_type = sprite_type;
    }

    override setPosition_initial(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = Math.random() * (canvasHeight - this.height);
        this.isAtEdge = false;
    }

    public setPosition_advanceOneStep() {
        if (this.x + this.speed > 0) {
            this.x += this.speed;
            this.isAtEdge = false;
        } else {
            this.isAtEdge = true;
        }
    }

    public setPosition_reset(canvasWidth: number, canvasHeight: number) {
        this.x = canvasWidth;
        this.y = Math.random() * (canvasHeight - this.height);
        this.isAtEdge = false;
    }
};

export class ProRunner extends Runner {
    public speed: number = 5;
    public isAtEdge: boolean = false;

    constructor(sprite_image: HTMLImageElement, sprite_width: number, sprite_height: number) {
        super(sprite_image, sprite_width, sprite_height);
    }

    override setPosition_initial(canvasWidth: number, canvasHeight: number) {
        this.x = 0.3 * (canvasWidth - this.width);
        this.y = 0.5 * (canvasHeight - this.height);
        this.isAtEdge = false;
    }

    public setPosition_advanceOneStep() {
        if (this.x + this.speed > 0) {
            this.x += this.speed;
            this.isAtEdge = false;
        } else {
            this.isAtEdge = true;
        }
    }
};

export class ProDogs extends ProRunner {
    constructor(sprite_image: HTMLImageElement, sprite_width: number, sprite_height: number) {
        super(sprite_image, sprite_width, sprite_height);
    }

    override setPosition_initial(canvasWidth: number, canvasHeight: number) {
        this.x = 0;
        this.y = 0.5 * (canvasHeight - this.height);
        this.isAtEdge = false;
    }

    public penalize() {
        if (this.speed > 1) {
            this.speed -= 1;
        }
    }
};
