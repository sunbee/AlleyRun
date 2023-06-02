import { Injectable } from '@angular/core';
import { Sprite, Runner, Obstacle, ProRunner, ProDogs } from './sprite.model';

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
      runner_image.src = image_src;
      runner_image.onload = () => {
        console.log("Voici Runner!");
        const width = runner_image.width;
        const height = runner_image.height;
        const runner = new Runner(runner_image, width, height);
        resolve(runner);
      }
    })
  }

  async getProRunner(image_src: string): Promise<ProRunner> {
    return new Promise((resolve) => {
      const proRunner_image = new Image();
      proRunner_image.src = image_src;
      proRunner_image.onload = () => {
        console.log("Voici Progress-Bar Runner!");
        const width = proRunner_image.width;
        const height = proRunner_image.height;
        const spriteProRunner = new ProRunner(proRunner_image, width, height);
        resolve(spriteProRunner);
      }
    })
  }

  async getProDogs(image_src: string): Promise<ProDogs> {
    return new Promise((resolve) => {
      const proDogs_image = new Image();
      proDogs_image.src = image_src;
      proDogs_image.onload = () => {
        console.log("Voice Progress-Bar Dogs!");
        const width = proDogs_image.width;
        const height = proDogs_image.height;
        const sprite_proDogs = new ProDogs(proDogs_image, width, height);
        resolve(sprite_proDogs)
      }

    })
  }
}
