/**
 * Created by lumpiluk on 9/27/16.
 */

const TEXTURE_SIZE = 256;

/**
 * Adapted from https://stemkoski.github.io/Three.js/Sprite-Text-Labels.html.
 */
export class TextSprite {
    constructor(text, scale) {
        let fontface = "sans-serif";
        let fontsize = 240;
        let border_thickness = 4;

        let canvas = document.createElement('canvas');
        canvas.width = TEXTURE_SIZE;
        canvas.height = TEXTURE_SIZE;
        let context = canvas.getContext('2d');
        //context.font = "Bold " + fontsize + "px " + fontface;
        context.font = fontsize + "px " + fontface;

        // get size data (height depends only on font size)
        var text_width = context.measureText(text).width;

        //DEBUG
        /*
        context.fillStyle = "rgba(0, 0, 0, 1)";
        context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
        */

        // text color
        context.fillStyle = "rgba(100%, 100%, 100%, 1.0)";
        context.fillText(text, 0, fontsize);

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

    get_sprite() {
        return this.sprite;
    }
}
