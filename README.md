# gl-shader-hook [![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges) #

Instruments WebGL shaders to keep track of updates and modify existing shaders
on the fly.

## Usage ##

[![gl-shader-hook](https://nodei.co/npm/gl-shader-hook.png?mini=true)](https://nodei.co/npm/gl-shader-hook)

### `hook = require('gl-shader-hook')(gl)` ###

Takes a WebGL canvas context `gl`, instrumenting that context and returning an
EventEmitter.

### `hook.shaders` ###

An object listing all of the currently discovered shaders. Each of these are
wrapped in a class to provide you with some extra information and
functionality. Unless otherwise specified, "shaders" and "programs" in these
docs from here on out refer to wrapped shaders and wrapped programs.

### `hook.programs` ###

An object listing all of the currently discovered programs.

### `hook.on('shader', callback(shader))` ###

Emitted when a new shader is created.

### `hook.on('program', callback(program))` ###

Emitted when a new program is created.

### `hook.on('compiled', callback(shader))` ###

Emitted whenever a shader's source is successfully compiled.

### `hook.on('linked', callback(program))` ###

Emitted whenever a program is successfully linked.

### `shader.on('compiled', callback)` ###

Emitted whenever that shader has been successfully compiled.

### `shader.updateSource(source)` ###

Updates a shader's source and recompiles it.

## License ##

MIT. See [LICENSE.md](http://github.com/hughsk/gl-shader-hook/blob/master/LICENSE.md) for details.
