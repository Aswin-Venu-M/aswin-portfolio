import Phaser from "phaser";

// Access MatterJS through Phaser's re-export — do NOT import "matter-js" directly.
// matter-js is bundled inside Phaser and is not an installed standalone package.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Matter = (Phaser.Physics.Matter as any).Matter as typeof MatterJS;

type MatterScene = Phaser.Scene & { matter: Phaser.Physics.Matter.MatterPhysics };

export class Player {
  sprite: Phaser.Physics.Matter.Image;
  private scene: MatterScene;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private constraint: any = null;
  private isSwinging = false;
  anchorX = 0;
  anchorY = 0;

  constructor(scene: MatterScene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.matter.add.image(x, y, "spidey-run", undefined, {
      frictionAir: 0.01,
      restitution: 0,
      label: "player",
    });
    this.sprite.setFixedRotation();
    this.sprite.setScale(3);
  }

  fireWeb(anchorX: number, anchorY: number) {
    this.releaseWeb();

    const ropeLen = Phaser.Math.Clamp(
      Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, anchorX, anchorY),
      120,
      200
    );

    const matterWorld = (this.scene.matter.world as Phaser.Physics.Matter.World).localWorld as unknown as MatterJS.CompositeType;

    this.constraint = Matter.Constraint.create({
      pointA: { x: anchorX, y: anchorY },
      bodyB: this.sprite.body as MatterJS.BodyType,
      length: ropeLen,
      stiffness: 0.02,
      damping: 0.01,
    });

    Matter.Composite.add(matterWorld, this.constraint);

    this.anchorX = anchorX;
    this.anchorY = anchorY;
    this.isSwinging = true;
    this.sprite.setTexture("spidey-swing");
  }

  releaseWeb() {
    if (this.constraint) {
      const matterWorld = (this.scene.matter.world as Phaser.Physics.Matter.World).localWorld as unknown as MatterJS.CompositeType;
      Matter.Composite.remove(matterWorld, this.constraint);
      this.constraint = null;
    }
    this.isSwinging = false;
  }

  get swinging() {
    return this.isSwinging;
  }

  update() {
    if (this.isSwinging) {
      this.sprite.setTexture("spidey-swing");
    } else if (((this.sprite.body as MatterJS.BodyType)?.velocity?.y ?? 0) > 0.5) {
      this.sprite.setTexture("spidey-fall");
    } else {
      this.sprite.setTexture("spidey-run");
    }
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  destroy() {
    this.releaseWeb();
    this.sprite.destroy();
  }
}
