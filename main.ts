//% color="#772299" weight=90
//% groups="['Simple particles', 'Texture Particles', 'Animated Particles', 'Fire Particles', 'others']"
namespace advancedParticles{
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
        teleport(x: number, y: number) {
            this.x = x
            this.y = y
        }
    }
    //% block="accelerate $particle in direction of $direction degrees at %strength px/s"
    //% group="others"
    export function accelerate(particle:Particle, direction:number, strength:number){
        particle.accelerate(direction * (Math.PI/180), strength)
    }
    //% block="delete %particle"
    //% group="others"
    export function remove(particle:Particle){
        particle.kill()
    }
    export class SimpleParticle extends Particle {
        color: number
        constructor(color: number, lifetime: number) {
            super(lifetime)
            this.color = color
        }
        render(screen: Image) {
            screen.setPixel(this.x, this.y, this.color)
        }
    }
    //% block="create colored particle with color $color lifetime $lifetime s"
    //% color.shadow="colorNumberPicker"
    //% group="Simple particles"
    export function createAndReturnSimpleParticle(color:number, lifetime:number): SimpleParticle{
        return new SimpleParticle(color, lifetime)
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
        }
    }
    //% block="create texture particle with texture $texture lifetime $lifetime s"
    //% group="Texture particles"
    export function createAndReturnTextureParticle(texture:Image, lifetime: number): TextureParticle {
        return new TextureParticle(texture, lifetime)
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
        }
    }
    //% block="create animated particle with animation $anim , frame length $frameLength s and lifetime $lifetime s"
    //% group="Animated particles"
    export function createAndReturnAnimatedParticle(anim: Image[], frameLength:number, lifetime: number): AnimatedParticle {
        return new AnimatedParticle(anim, frameLength, lifetime)
    }
    class FireParticle extends Particle {
        gradient: number[]
        spark: boolean
        private originalLifetime: number
        constructor(gradient: number[], lifetime: number) {
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
        spawnAcceleration: number
        constructor(spawnDelay: number, lifetime: number) {
            this.x = 0
            this.y = 0
            this.square = true
            this.size = 10
            this.spawnDelay = spawnDelay
            this.currentSpawnTime = 0
            this.spawnLifetimeRange = [lifetime, lifetime]
            this.spawnVxRange = [0, 0]
            this.spawnVyRange = [0, 0]
            this.spawnAcceleration = 1
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
            newParticle.teleport(spawnPos[0], spawnPos[1])
            newParticle.vx = randomFromRange(this.spawnVxRange)
            newParticle.vy = randomFromRange(this.spawnVyRange)
            newParticle.acceleration = this.spawnAcceleration
        }
    }
    class SimpleSpawner extends Spawner {
        color: number
        constructor(spawnDelay: number, lifetime: number, color: number) {
            super(spawnDelay, lifetime)
            this.color = color
        }
        spawn() {
            let newParticle = new SimpleParticle(this.color,
                randomFromRange(this.spawnLifetimeRange)
            )
            this.addSpawnData(newParticle)
        }
    }
    class TextureSpawner extends Spawner {
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
    class AnimatedSpawner extends Spawner {
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
    class FireSpawner extends Spawner {
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

    function spawnParticlesFromTexture(x: number, y: number, texture: Image, lifetime: number) {
        let returnParticleArray = []
        for (let cx = 0; cx < image.getDimension(texture, image.Dimension.Width); cx++) {
            for (let cy = 0; cy < image.getDimension(texture, image.Dimension.Height); cy++) {
                let newParticle = new SimpleParticle(texture.getPixel(cx, cy), lifetime)
                newParticle.teleport(x + cx, y + cy)
                returnParticleArray.push(newParticle)
            }
        }
        return returnParticleArray
    }
    function globalAccelerate(direction: number, strength: number) {
        for (let particle of particleList) {
            particle.accelerate(direction, strength)
        }
    }
    //global accelerate radial()
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