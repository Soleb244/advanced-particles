//% color="#772299" weight=90
//% groups='["General", "Colored particles", "Texture particles", "Animated particles", "Fire particles", "Others"]'
//% subcategories='["Spawners", "Areas"]'
namespace advancedParticles {
    export enum ParticleProperties {
        //% block="x"
        X,
        //% block="y"
        Y,
        //% block="vx"
        Vx,
        //% block="vy"
        Vy,
        //% block="acceleration"
        Acceleration
    }
    export enum SpawnerProperties {
        //% block="x"
        X,
        //% block="y"
        Y,
        //% block="size"
        Size,
        //% block="spawn delay"
        SpawnDelay
    }
    export enum SpawnerRangeProperties {
        //% block="vx"
        Vx,
        //% block="vy"
        Vy,
        //% block="acceleration"
        Acceleration
    }
    export enum Shape {
        //% block="square"
        Square = 1,
        //% block="circle"
        Circle = 0
    }

    function randomFromRange(range: number[]) {
        return randint(range[0], range[1])
    }
    let particleList: Particle[] = []
    //abstract
    class Particle {
        x: number
        y: number
        vx: number
        vy: number
        acceleration: number
        lifetime: number
        dynamic: boolean
        constructor(lifetime: number) {
            this.x = 0
            this.y = 0
            this.vx = 0
            this.vy = 0
            this.acceleration = 1
            this.lifetime = lifetime
            this.dynamic = true
            particleList.push(this)
        }
        update(deltaTime: number) {
            if (this.dynamic) {
                let acceleration = this.acceleration ** deltaTime
                this.vx *= acceleration
                this.vy *= acceleration
                this.x += this.vx * deltaTime
                this.y += this.vy * deltaTime
            }
            this.lifetime -= deltaTime
        }
        //abstract
        render(screen: Image) { }

        //methods
        accelerate(direction: number, strength: number) {
            this.vx += strength * Math.cos(direction)
            this.vy += strength * Math.sin(direction)
        }
        kill() {
            particleList.removeElement(this)
        }
    }
    //% blockId=advancedParticles_accelerate
    //% block="accelerate $particle in direction of $direction degrees at %strength px/s"
    //% particle.shadow=variables_get
    //% particle.defl=myParticle
    //% group="General"
    export function accelerate(particle: Particle, direction: number, strength: number) {
        particle.accelerate(direction * (Math.PI / 180), strength)
    }
    //% blockId=advancedParticles_globalAccelerate
    //% block="accelerate all particles in direction of $direction degrees at %strength px/s"
    //% group="General"
    export function globalAccelerate(direction: number, strength: number) {
        for (let particle of particleList) {
            particle.accelerate(direction, strength)
        }
    }


    //radial accelerate


    //% blockId=advancedParticles_teleport
    //% block="teleport $particle to x $x y $y"
    //% particle.shadow=variables_get
    //% particle.defl=myParticle
    //% group="General"
    export function teleport(particle: Particle, x: number, y: number) {
        particle.x = x
        particle.y = y
    }
    //% blockId=advancedParticles_setProperty
    //% block="set $particle $property to %value"
    //% particle.shadow=variables_get
    //% particle.defl=myParticle
    //% group="General"
    export function setProperty(particle: Particle, property: ParticleProperties, value: number) {
        switch (property) {
            case ParticleProperties.X:
                particle.x = value
                break
            case ParticleProperties.Y:
                particle.y = value
                break
            case ParticleProperties.Vx:
                particle.vx = value
                break
            case ParticleProperties.Vy:
                particle.vy = value
                break
            case ParticleProperties.Acceleration:
                particle.acceleration = value
                break
        }
    }
    //% blockId=advancedParticles_setDynamic
    //% block="set $particle dynamic to $dynamic"
    //% particle.shadow=variables_get
    //% particle.defl=myParticle
    //% group="General"
    export function setDynamic(particle: Particle, dynamic: boolean) {
        particle.dynamic = dynamic
    }
    //% blockId=advancedParticles_getProperty
    //% block="$particle $property"
    //% particle.shadow=variables_get
    //% particle.defl=myParticle
    //% group="General"
    export function getProperty(particle: Particle, property: ParticleProperties): number {
        switch (property) {
            case ParticleProperties.X:
                return particle.x
            case ParticleProperties.Y:
                return particle.y
            case ParticleProperties.Vx:
                return particle.vx
            case ParticleProperties.Vy:
                return particle.vy
            case ParticleProperties.Acceleration:
                return particle.acceleration
        }
    }
    //% blockId=advancedParticles_getDynamic
    //% block="$particle is dynamic"
    //% particle.shadow=variables_get
    //% particle.defl=myParticle
    //% group="General"
    export function getDynamic(particle: Particle): boolean {
        return particle.dynamic
    }
    export class ColoredParticle extends Particle {
        color: number
        constructor(color: number, lifetime: number) {
            super(lifetime)
            this.color = color
        }
        render(screen: Image) {
            screen.setPixel(this.x, this.y, this.color)
        }
    }
    //% blockId=advancedParticles_createColoredParticle
    //% block="create colored particle with color $color lifetime $lifetime s"
    //% blockSetVariable=myParticle
    //% color.shadow=colorindexpicker
    //% group="Colored particles"
    //% weight=10
    export function createAndReturnColoredParticle(color: color, lifetime: number): ColoredParticle {
        return new ColoredParticle(color, lifetime)
    }
    //% blockId=advancedParticles_setParticleColor
    //% block="set color of $particle to $color"
    //% color.shadow=colorindexpicker
    //% particle.shadow=variables_get
    //% particle.defl=myParticle
    //% group="Colored particles"
    //% weight=5
    export function setParticleColor(particle: ColoredParticle, color: color) {
        particle.color = color
    }
    //% blockId=advancedParticles_spawnParticlesFromTexture
    //% block="Array of colored particles from $texture at x $x y $y with lifetime $lifetime s"
    //% texture.shadow=screen_image_picker
    //% group="Colored particles"
    //% weight=4
    export function spawnParticlesFromTexture(x: number, y: number, texture: Image, lifetime: number): ColoredParticle[] {
        let returnParticleArray = []
        for (let cx = 0; cx < image.getDimension(texture, image.Dimension.Width); cx++) {
            for (let cy = 0; cy < image.getDimension(texture, image.Dimension.Height); cy++) {
                let newParticle = new ColoredParticle(texture.getPixel(cx, cy), lifetime)
                teleport(newParticle, x + cx, y + cy)
                returnParticleArray.push(newParticle)
            }
        }
        return returnParticleArray
    }
    export class TextureParticle extends Particle {
        texture: Image
        constructor(texture: Image, lifetime: number) {
            super(lifetime)
            this.texture = texture
        }
        render(screen: Image) {
            let x = this.x - image.getDimension(this.texture, image.Dimension.Width) / 2
            let y = this.y - image.getDimension(this.texture, image.Dimension.Height) / 2
            screen.drawTransparentImage(this.texture, x, y)
        }
        disintegrate() {
            let particles = spawnParticlesFromTexture(
                this.x - image.getDimension(this.texture, image.Dimension.Width) / 2,
                this.y - image.getDimension(this.texture, image.Dimension.Height) / 2,
                this.texture, this.lifetime)
            for (let particle of particles) {
                particle.vx = this.vx
                particle.vy = this.vy
                particle.acceleration = this.acceleration
                particle.dynamic = this.dynamic
            }
            return particles
        }
    }
    //% blockId=advancedParticles_createTextureParticle
    //% block="create texture particle with texture $texture lifetime $lifetime s"
    //% blockSetVariable=myParticle
    //% texture.shadow=screen_image_picker
    //% group="Texture particles"
    export function createAndReturnTextureParticle(texture: Image, lifetime: number): TextureParticle {
        return new TextureParticle(texture, lifetime)
    }
    //% blockId=advancedParticles_setParticleTexture
    //% block="set texture of $particle to $texture"
    //% texture.shadow=screen_image_picker
    //% particle.shadow=variables_get
    //% particle.defl=myParticle
    //% group="Texture particles"
    export function setParticleTexture(particle: TextureParticle, texture: Image) {
        particle.texture = texture
    }
    class AnimatedParticle extends Particle {
        animation: Image[]
        frameLength: number
        currentFrame: Image
        currentFrameIndex: number
        private currentFrameDuration: number
        constructor(animation: Image[], frameLength: number, lifetime: number) {
            super(lifetime)
            this.animation = animation
            this.frameLength = frameLength / 1000
            this.currentFrame = animation[0]
            this.currentFrameIndex = 0
            this.currentFrameDuration = 0
        }
        update(deltaTime: number) {
            super.update(deltaTime)
            this.currentFrameDuration += deltaTime
            while (this.currentFrameDuration >= this.frameLength) {
                this.currentFrameIndex++
                this.currentFrameDuration -= this.frameLength
            }
            this.currentFrameIndex %= this.animation.length
            this.currentFrame = this.animation[this.currentFrameIndex]
        }
        render(screen: Image) {
            let x = this.x - image.getDimension(this.currentFrame, image.Dimension.Width) / 2
            let y = this.y - image.getDimension(this.currentFrame, image.Dimension.Height) / 2
            screen.drawTransparentImage(this.currentFrame, x, y)
        }

        disintegrate() {
            let particles = spawnParticlesFromTexture(
                this.x - image.getDimension(this.currentFrame, image.Dimension.Width) / 2,
                this.y - image.getDimension(this.currentFrame, image.Dimension.Height) / 2,
                this.currentFrame, this.lifetime)
            for (let particle of particles) {
                particle.vx = this.vx
                particle.vy = this.vy
                particle.acceleration = this.acceleration
                particle.dynamic = this.dynamic
            }
            return particles
        }
    }
    //% blockId=advancedParticles_createAnimatedParticle
    //% block="create animated particle with animation $anim , frame length $frameLength s and lifetime $lifetime s"
    //% blockSetVariable=myParticle
    //% anim.shadow=animation_editor
    //% group="Animated particles"
    export function createAndReturnAnimatedParticle(anim: Image[], frameLength: number, lifetime: number): AnimatedParticle {
        return new AnimatedParticle(anim, frameLength, lifetime)
    }
    //% blockId=advancedParticles_setParticleAnim
    //% block="set animation of $particle to $anim with framelength $frameLength"
    //% anim.shadow=animation_editor
    //% particle.shadow=variables_get
    //% particle.defl=myParticle
    //% group="Animated particles"
    export function setParticleAnim(particle: AnimatedParticle, anim: Image[], frameLength: number) {
        particle.animation = anim
        particle.frameLength = frameLength
    }
    class FireParticle extends Particle {
        gradient: color[]
        spark: boolean
        private originalLifetime: number
        constructor(gradient: color[], lifetime: number) {
            super(lifetime)
            this.originalLifetime = lifetime
            this.gradient = gradient
            this.spark = false
            this.acceleration = 0.3
        }
        update(deltaTime: number) {
            super.update(deltaTime)
            this.vy -= 20 * deltaTime
            if (Math.percentChance(700 * deltaTime))
                this.x += randint(-1, 1)
        }
        render(screen: Image) {
            let progress = 1 - this.lifetime / this.originalLifetime
            let color = Math.floor(progress * this.gradient.length)
            color = Math.min(color, this.gradient.length - 1)
            screen.setPixel(this.x, this.y, this.gradient[Math.round(color)])
            if (this.spark) {
                if (color >= this.gradient.length - 1) {
                    this.spark = false
                    return
                }
                if (color == 0) { return }
                let outerColor = this.gradient[Math.round(color + randint(0, 1))]
                if (Math.percentChance(70)) { screen.setPixel(this.x + 1, this.y, outerColor) }
                if (Math.percentChance(70)) { screen.setPixel(this.x - 1, this.y, outerColor) }
                if (Math.percentChance(70)) { screen.setPixel(this.x, this.y + 1, outerColor) }
                if (Math.percentChance(70)) { screen.setPixel(this.x, this.y - 1, outerColor) }
            }
        }
    }
    //% blockId=advancedParticles_createFireParticle
    //% block="create fire particle with gradient $gradient lifetime $lifetime s"
    //% blockSetVariable=myParticle
    //% gradient.shadow="lists_create_with"
    //% gradient.defl=colorindexpicker
    //% group="Fire particles"
    export function createAndReturnFireParticle(gradient: color[], lifetime: number): FireParticle {
        return new FireParticle(gradient, lifetime)
    }
    //% blockId=advancedParticles_disintegade_noReturn
    //% block="disintegrate $particle"
    //% particle.shadow=variables_get
    //% particle.defl=myParticle
    //% group="Others"
    export function disintegrateNoReturn(particle: TextureParticle | AnimatedParticle) {
        particle.disintegrate()
    }
    //% blockId=advancedParticles_disintegade_withReturn
    //% block="disintegrate $particle"
    //% particle.shadow=variables_get
    //% particle.defl=myParticle
    //% group="Others"
    export function disintegrateWithReturn(particle: TextureParticle | AnimatedParticle): ColoredParticle[] {
        return particle.disintegrate()
    }

    let spawnerList: Spawner[] = []
    //abstract
    class Spawner {
        x: number
        y: number
        square: boolean
        size: number
        spawnDelay: number
        currentSpawnTime: number
        spawnLifetimeRange: number[]
        spawnVxRange: number[]
        spawnVyRange: number[]
        spawnAccelerationRange: number[]
        constructor(spawnDelay: number, lifetime: number) {
            this.x = 0
            this.y = 0
            this.square = true
            this.size = 10
            this.spawnDelay = spawnDelay / 1000
            this.currentSpawnTime = 0
            this.spawnLifetimeRange = [lifetime, lifetime]
            this.spawnVxRange = [0, 0]
            this.spawnVyRange = [0, 0]
            this.spawnAccelerationRange = [1, 1]
            spawnerList.push(this)
        }
        spawnCoordinates() {
            if (this.square) {
                let x = randint(-this.size / 2, this.size / 2)
                let y = randint(-this.size / 2, this.size / 2)
                return ([this.x + x, this.y + y])
            }
            let angle = randint(0, 2 * Math.PI)
            let dist = Math.sqrt(randint(0, 1000) / 1000) * this.size
            let x = dist * Math.cos(angle)
            let y = dist * Math.sin(angle)
            return ([this.x + x, this.y + y])
        }
        update(deltaTime: number) {
            this.currentSpawnTime += deltaTime
            while (this.currentSpawnTime >= this.spawnDelay) {
                this.spawn()
                this.currentSpawnTime -= this.spawnDelay
            }
        }
        //abstract
        spawn() { }

        addSpawnData(newParticle: Particle) {
            let spawnPos = this.spawnCoordinates()
            teleport(newParticle, spawnPos[0], spawnPos[1])
            newParticle.vx = randomFromRange(this.spawnVxRange)
            newParticle.vy = randomFromRange(this.spawnVyRange)
            newParticle.acceleration = randomFromRange(this.spawnAccelerationRange)
        }
    }
    //% blockId=advancedParticles_setSpawnerProperty
    //% block="set $spawner $property to $value"
    //% spawner.shadow=variables_get
    //% spawner.defl=mySpawner
    //% subcategory="Spawners"
    //% group="General"
    export function setSpawnerProperty(spawner: Spawner, property: SpawnerProperties, value: number) {
        switch (property) {
            case SpawnerProperties.X:
                spawner.x = value
                break
            case SpawnerProperties.Y:
                spawner.y = value
                break
            case SpawnerProperties.Size:
                spawner.size = value
                break
            case SpawnerProperties.SpawnDelay:
                spawner.spawnDelay = value
                break
        }
    }
    //% blockId=advancedParticles_getSpawnerProperty
    //% block="get $spawner $property"
    //% spawner.shadow=variables_get
    //% spawner.defl=mySpawner
    //% subcategory="Spawners"
    //% group="General"
    export function getSpawnerProperty(spawner: Spawner, property: SpawnerProperties): SpawnerProperties {
        switch (property) {
            case SpawnerProperties.X:
                return spawner.x
            case SpawnerProperties.Y:
                return spawner.y
            case SpawnerProperties.Size:
                return spawner.size
            case SpawnerProperties.SpawnDelay:
                return spawner.spawnDelay
        }
    }
    //% blockId=advancedParticles_setSpawnerRange
    //% block="set $spawner random $property to min $min max $max"
    //% spawner.shadow=variables_get
    //% spawner.defl=mySpawner
    //% subcategory="Spawners"
    //% group="General"
    export function setSpawnerRange(spawner: Spawner, property: SpawnerRangeProperties, min: number, max: number) {
        switch (property) {
            case SpawnerRangeProperties.Vx:
                spawner.spawnVxRange = [min, max]
                break
            case SpawnerRangeProperties.Vy:
                spawner.spawnVxRange = [min, max]
                break
            case SpawnerRangeProperties.Acceleration:
                spawner.spawnAccelerationRange = [min, max]
                break
        }
    }
    //% blockId=advancedParticles_getSpawnerRange
    //% block="get $spawner random $property"
    //% spawner.shadow=variables_get
    //% spawner.defl=mySpawner
    //% subcategory="Spawners"
    //% group="General"
    export function getSpawnerRange(spawner: Spawner, property: SpawnerRangeProperties): number[] {
        switch (property) {
            case SpawnerRangeProperties.Vx:
                return spawner.spawnVxRange
            case SpawnerRangeProperties.Vy:
                return spawner.spawnVyRange
            case SpawnerRangeProperties.Acceleration:
                return spawner.spawnAccelerationRange
        }
    }
    //% blockId=advancedParticles_setSpawnerShape
    //% block="set $spawner shape to $shape"
    //% spawner.shadow=variables_get
    //% spawner.defl=mySpawner
    //% subcategory="Spawners"
    //% group="General"
    export function setSpawnerShape(spawner: Spawner, shape: Shape) {
        spawner.square = shape == 1
    }
    //% blockId=advancedParticles_getSpawnerShape
    //% block="$spawner is a square"
    //% spawner.shadow=variables_get
    //% spawner.defl=mySpawner
    //% subcategory="Spawners"
    //% group="General"
    export function getSpawnerShape(spawner: Spawner) {
        return spawner.square
    }
    export class ColoredSpawner extends Spawner {
        color: number
        constructor(spawnDelay: number, lifetime: number, color: number) {
            super(spawnDelay, lifetime)
            this.color = color
        }
        spawn() {
            let newParticle = new ColoredParticle(this.color,
                randomFromRange(this.spawnLifetimeRange)
            )
            this.addSpawnData(newParticle)
        }
    }
    //% blockId=advancedParticles_createColoredSpawner
    //% block="create spawner of particles with color $color and lifetime $lifetime spawn every $spawnDelay ms in a $square of size $size"
    //% spawnDelay.defl=100
    //% size.defl=10
    //% color.shadow=colorindexpicker
    //% blockSetVariable=mySpawner
    //% subcategory="Spawners"
    //% group="Colored spawners"
    export function createColoredSpawner(lifetime: number, color: color, spawnDelay: number, square: Shape, size: number): ColoredSpawner {
        let newSpawner = new ColoredSpawner(spawnDelay, lifetime, color)
        newSpawner.square = square == 1
        newSpawner.size = size
        return newSpawner
    }
    //% blockId=advancedParticles_setSpawnerColor
    //% block="set $spawner color to $color"
    //% spawner.shadow=variables_get
    //% spawner.defl=mySpawner
    //% color.shadow=colorindexpicker
    //% subcategory="Spawners"
    //% group="Colored spawners"
    export function setSpawnerColor(spawner: ColoredSpawner, color: color) {
        spawner.color = color
    }
    //% blockId=advancedParticles_getSpawnerColor
    //% block="$spawner color"
    //% spawner.shadow=variables_get
    //% spawner.defl=mySpawner
    //% subcategory="Spawners"
    //% group="Colored spawners"
    export function getSpawnerColor(spawner: ColoredSpawner): color {
        return spawner.color
    }
    export class TextureSpawner extends Spawner {
        texture: Image
        constructor(spawnDelay: number, lifetime: number, texture: Image) {
            super(spawnDelay, lifetime)
            this.texture = texture
        }
        spawn() {
            let newParticle = new TextureParticle(this.texture,
                randomFromRange(this.spawnLifetimeRange)
            )
            this.addSpawnData(newParticle)
        }
    }
    //% blockId=advancedParticles_createTextureSpawner
    //% block="create spawner of particles with texture $texture and lifetime $lifetime spawn every $spawnDelay ms in a $square of size $size"
    //% spawnDelay.defl=100
    //% size.defl=10
    //% texture.shadow=screen_image_picker
    //% blockSetVariable=mySpawner
    //% subcategory="Spawners"
    //% group="Texture spawners"
    export function createTextureSpawner(lifetime: number, texture: Image, spawnDelay: number, square: Shape, size: number): TextureSpawner {
        let newSpawner = new TextureSpawner(spawnDelay, lifetime, texture)
        newSpawner.square = square == 1
        newSpawner.size = size
        return newSpawner
    }
    //% blockId=advancedParticles_setSpawnerTexture
    //% block="set $spawner texture to $texture"
    //% spawner.shadow=variables_get
    //% spawner.defl=mySpawner
    //% texture.shadow=screen_image_picker
    //% subcategory="Spawners"
    //% group="Texture spawners"
    export function setSpawnerTecture(spawner: TextureSpawner, texture: Image) {
        spawner.texture = texture
    }
    //% blockId=advancedParticles_getSpawnerTexture
    //% block="$spawner texture"
    //% spawner.shadow=variables_get
    //% spawner.defl=mySpawner
    //% subcategory="Spawners"
    //% group="Texture spawners"
    export function getSpawnerTexture(spawner: TextureSpawner): Image {
        return spawner.texture
    }
    export class AnimatedSpawner extends Spawner {
        animation: Image[]
        frameLength: number
        constructor(spawDelay: number, lifetime: number, animation: Image[], frameLength: number) {
            super(spawDelay, lifetime)
            this.animation = animation
            this.frameLength = frameLength
        }
        spawn() {
            let newParticle = new AnimatedParticle(this.animation,
                this.frameLength,
                randomFromRange(this.spawnLifetimeRange)
            )
            this.addSpawnData(newParticle)
        }
    }
    //% blockId=advancedParticles_createAnimatedSpawner
    //% block="create spawner of particles with animation $anim with framelength of $frameLength and lifetime $lifetime spawn every $spawnDelay ms in a $square of size $size"
    //% spawnDelay.defl=100
    //% size.defl=10
    //% anim.shadow=animation_editor
    //% blockSetVariable=mySpawner
    //% subcategory="Spawners"
    //% group="Animated spawners"
    export function createAnimatedSpawner(lifetime: number, anim: Image[], frameLength: number, spawnDelay: number, square: Shape, size: number): AnimatedSpawner {
        let newSpawner = new AnimatedSpawner(spawnDelay, lifetime, anim, frameLength)
        newSpawner.square = square == 1
        newSpawner.size = size
        return newSpawner
    }
    //% blockId=advancedParticles_setSpawnerAnim
    //% block="set $spawner animation to $anim with framelength $frameLength"
    //% spawner.shadow=variables_get
    //% spawner.defl=mySpawner
    //% anim.shadow=animation_editor
    //% subcategory="Spawners"
    //% group="Animated spawners"
    export function setSpawnerAnim(spawner: AnimatedSpawner, anim: Image[], frameLength: number) {
        spawner.animation = anim
        spawner.frameLength = frameLength
    }
    //% blockId=advancedParticles_getSpawnerAnim
    //% block="$spawner texture"
    //% spawner.shadow=variables_get
    //% spawner.defl=mySpawner
    //% subcategory="Spawners"
    //% group="Animated spawners"
    export function getSpawnerAnim(spawner: AnimatedSpawner): Image[] {
        return spawner.animation
    }
    //% blockId=advancedParticles_getSpawnerFrameLength
    //% block="$spawner frameLength"
    //% spawner.shadow=variables_get
    //% spawner.defl=mySpawner
    //% subcategory="Spawners"
    //% group="Animated spawners"
    export function getSpawnerFrameLength(spawner: AnimatedSpawner): number {
        return spawner.frameLength
    }
    export class FireSpawner extends Spawner {
        gradient: number[]
        sparkChance: number
        constructor(spawnDelay: number, lifetime: number, gradient: number[]) {
            super(spawnDelay, lifetime)
            this.gradient = gradient
            this.sparkChance = 0
        }
        spawn() {
            let newParticle = new FireParticle(this.gradient,
                randomFromRange(this.spawnLifetimeRange)
            )
            this.addSpawnData(newParticle)
            newParticle.spark = Math.percentChance(this.sparkChance)
        }
    }
    //% blockId=advancedParticles_createFireSpawner
    //% block="create spawner of fire particles with gradient $gradient and lifetime $lifetime spawn every $spawnDelay ms in a $square of size $size"
    //% spawnDelay.defl=100
    //% size.defl=10
    //% gradient.shadow="lists_create_with"
    //% gradient.defl=colorindexpicker
    //% blockSetVariable=mySpawner
    //% subcategory="Spawners"
    //% group="Fire Spawners"
    export function createFireSpawner(lifetime: number, gradient: color[], spawnDelay: number, square: Shape, size: number): FireSpawner {
        let newSpawner = new FireSpawner(spawnDelay, lifetime, gradient)
        newSpawner.square = square == 1
        newSpawner.size = size
        return newSpawner
    }
    //area effects

    let time: number = game.runtime()
    let deltaTime: number = 0
    drawing.renderAtZIndex(0, function (screen: Image) {
        deltaTime = (game.runtime() - time) / 1000
        time = game.runtime()
        let index = 0
        while (index < particleList.length) {
            let p = particleList[index]
            p.update(deltaTime)
            if (p.lifetime <= 0) {
                particleList.removeElement(p)
                continue
            }
            p.render(screen)
            index++
        }
        for (let spawner of spawnerList) {
            spawner.update(deltaTime)
        }
    })

}