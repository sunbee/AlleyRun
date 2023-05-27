import { Injectable } from '@angular/core';
import { Sprite, Runner, Obstacle } from './sprite.model';

@Injectable({
  providedIn: 'root'
})
export class SpriteService {

  constructor() { }

  async getObstacleSprites(n: number, obstacle_type: string, image_src: string): Promise<Obstacle[]> {
    const obstacles: Obstacle[] = [];
    const loadPromises: Promise<void>[] = [];

    for (let i=0; i<n; i++) {
      const promise = new Promise<void>((resolve) => {
        const sprite_image = new Image();
        sprite_image.src = image_src;
        sprite_image.onload = () => {
          console.log("Voice Obstacle!")
          const width = sprite_image.width;
          const height = sprite_image.height;
          const obstacle = new Obstacle(sprite_image, width, height, obstacle_type);
          obstacles.push(obstacle);
          console.log("Loaded: " + obstacle.sprite_type);
          resolve();
        }
      });
      loadPromises.push(promise);
    }

    await Promise.all(loadPromises);
    console.log("Returning: " + obstacles);
    return obstacles;
  };

  async getRunner(image_src: string): Promise<Runner> {
    return new Promise((resolve) => {
      const runner_image = new Image();
      runner_image.src = 'assets/RunnerGuy.png';
      runner_image.onload = () => {
        console.log("Voici Runner!");
        const width = runner_image.width;
        const height = runner_image.height;
        const runner = new Runner(runner_image, width, height);
        resolve(runner);
      }
    })
  }
}
