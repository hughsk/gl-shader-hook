var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

module.exports = shaderHook

function shaderHook(gl, program_id, shader_id) {
  program_id = String(program_id || ('shader_hookp_' + String(Math.random()).slice(2)))
  shader_id = String(shader_id || ('shader_hooks_' + String(Math.random()).slice(2)))

  var hook = new EventEmitter
  var slice = Array.prototype.slice
  var program_counter = 0
  var shader_counter = 0
  var programs = hook.programs = {}
  var shaders = hook.shaders = {}

  var oCreateProgram = gl.createProgram
  var oCompileShader = gl.compileShader
  var oCreateShader = gl.createShader
  var oShaderSource = gl.shaderSource
  var oAttachShader = gl.attachShader
  var oDetachShader = gl.detachShader
  var oLinkProgram = gl.linkProgram

  inherits(HookProgram, EventEmitter)
  function HookProgram(program, id) {
    if (!(this instanceof HookProgram)) return new HookProgram(program, id)
    EventEmitter.call(this)
    this.program = program
    this.shaders = {}
    this.id = id
  }

  inherits(HookShader, EventEmitter)
  function HookShader(shader, id, kind) {
    if (!(this instanceof HookShader)) return new HookShader(shader, id, kind)
    EventEmitter.call(this)
    this.programs = {}
    this.shader = shader
    this.source = null
    this.id = id
    this.kind = (
        kind === gl.VERTEX_SHADER
      ? 'vertex'
      : kind === gl.FRAGMENT_SHADER
      ? 'fragment'
      : null
    )
  }

  HookShader.prototype.updateSource = function(source) {
    var programs = this.programs
    var shader = this.shader

    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    Object.keys(programs).forEach(function(pid) {
      gl.linkProgram(programs[pid].program)
    })
  }

  gl.createProgram = function createProgram() {
    var program = oCreateProgram.apply(this, slice.call(arguments))
    var id = program_counter++
    programs[id] = new HookProgram(program, id)
    hook.emit('program', programs[id])

    program[program_id] = id
    return program
  }

  gl.createShader = function createShader(kind) {
    var shader = oCreateShader.apply(this, slice.call(arguments))
    var id = shader_counter++
    shaders[id] = new HookShader(shader, id, kind)
    hook.emit('shader', shaders[id])
    shader[shader_id] = id
    return shader
  }

  gl.shaderSource = function shaderSource(shader, source) {
    var result = oShaderSource.apply(this, slice.call(arguments))
    var idx = shader[shader_id]
    shaders[idx].source = String(source)
    return result
  }

  gl.attachShader = function attachShader(program, shader) {
    var result = oAttachShader.apply(this, slice.call(arguments))
    var pid = program[program_id]
    var sid = shader[shader_id]
    programs[pid].shaders[sid] = shaders[sid]
    shaders[sid].programs[pid] = programs[pid]
    return result
  }

  gl.detachShader = function detachShader(program, shader) {
    var result = oDetachShader.apply(this, slice.call(arguments))
    var pid = program[program_id]
    var sid = shader[shader_id]
    delete programs[pid].shaders[sid]
    delete shaders[sid].programs[pid]
    return result
  }

  gl.compileShader = function compileShader(shader) {
    var result = oCompileShader.apply(this, slice.call(arguments))
    var successful = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (successful) {
      var target = shaders[shader[shader_id]]
      target.emit('compiled')
      hook.emit('compiled', target)
    }
    return result
  }

  gl.linkProgram = function linkProgram(program) {
    var result = oLinkProgram.apply(this, slice.call(arguments))
    var successful = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (successful) {
      var target = programs[program[program_id]]
      target.emit('linked')
      hook.emit('linked', target)
    }
    return result
  }

  return hook
}
