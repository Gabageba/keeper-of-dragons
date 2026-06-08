import Phaser from 'phaser';
import { gameConfig } from '@/config';

// Точка входа. Создаёт экземпляр игры Phaser и стартует цепочку сцен.
new Phaser.Game(gameConfig);
