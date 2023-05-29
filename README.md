# WebGL Renderer

A custom render engine using WebGL with the following features:
- Primitive Models such as Cubes, Spheres, and Cylinders
- Hierarchical Transformations
- Procedural Terrain Mesh Generation using Perlin Noise
- Simple Animated Water Mesh
- Ambient, Diffuse, and Specular Lighting
- Model Loading from Three.JavaScript Format (as JSON)
- Texture Mapping
- Color Gradient Sky
- Skybox
- Environment Cube Mapping
- UI Controls to Modify Program Settings

## Live Demo

* [https://ayaucode.github.io/WebGLRenderer/](https://ayaucode.github.io/WebGLRenderer/)

## Controls

- Use <kbd>M</kbd>/<kbd>N</kbd> to move the light **up**/**down** respectively
- Use arrow keys <kbd>UP</kbd> / <kbd>DOWN</kbd> / <kbd>LEFT</kbd> / <kbd>RIGHT</kbd> to move the light **forward**/**backward**/**left**/**right** respectively

### Camera Controls

With Free Cam **DISABLED**
- Use keys <kbd>W</kbd> / <kbd>A</kbd> / <kbd>S</kbd> / <kbd>D</kbd> to move the center hierarchical object **forward**/**left**/**backward**/**right** respectively
- Use keys <kbd>P</kbd> / <kbd>Y</kbd> / <kbd>R</kbd> to **pitch**/**yaw**/**roll** the camera respectively
- Press <kbd>SHIFT</kbd> and <kbd>P</kbd> / <kbd>Y</kbd> / <kbd>R</kbd> to **pitch**/**yaw**/**roll** the camera respectively in the **opposite** direction

With Free Cam **ENABLED**
- Use arrow keys <kbd>UP</kbd> / <kbd>DOWN</kbd> / <kbd>LEFT</kbd> / <kbd>RIGHT</kbd> to move the camera **forward**/**backward**/**left**/**right** respectively in the view direction
- Use <kbd>E</kbd> / <kbd>Q</kbd> to move the camera **up**/**down** respectively

## License

This project is licensed under the [MIT] License - see the [LICENSE](https://github.com/AyauCode/WebGLRenderer/blob/main/LICENSE) file for details

## Acknowledgments

* [toji and sinisterchipmunk](https://github.com/toji/gl-matrix)
* [josephg](https://github.com/josephg/noisejs)
* [hguo](https://github.com/hguo)
* 3D Models Obtained From: [https://rigmodels.com/index.php](https://rigmodels.com/index.php)