/**
 * Created by lumpiluk on 9/27/16.
 */

/**
 * Adapted from https://stemkoski.github.io/Three.js/Sprite-Text-Labels.html.
 */
export class CircleSprite {
    constructor(scale, texture_size, border_size) {
        let canvas = document.createElement('canvas');
        canvas.width = texture_size;
        canvas.height = texture_size;
        let context = canvas.getContext('2d');

        context.fillStyle = "rgba(100%, 100%, 100%, 1.0)";
        context.lineWidth = border_size;
        context.strokeStyle = "rgba(0, 0, 0, 1)";
        context.beginPath();
        context.arc(
            (texture_size - 1) / 2,
            (texture_size - 1) / 2,
            (texture_size - 1 - border_size) / 2, // border_size * 2 / 2
            0,
            2 * Math.PI
        );
        context.fill();
        context.stroke();

        // canvas contents will be used for a texture
        this.texture = new THREE.Texture(canvas);
        this.texture.needsUpdate = true;

        this.sprite_material = new THREE.SpriteMaterial({
            color: 0xffffff, // Texture is multiplied by this color.
            map: this.texture,
            rotation: 0,
            fog: false
        });
        this.sprite = new THREE.Sprite(this.sprite_material);
        this.sprite.scale.set(scale, scale, 1);
    }
}
