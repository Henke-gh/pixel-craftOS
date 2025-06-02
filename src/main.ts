import { Application, Container, Culler, Rectangle } from 'pixi.js'
import {
	handlePointerDown,
	handlePointerMove,
	handlePointerUp,
	hasCameraMovement,
	setCameraBorder,
	updateCameraMomentum,
	viewport
} from './core/cameraControls'
import { drawGroundTiles } from './core/groundTiles'
import {
	hasMovedToNewChunk,
	setInitalPrevRenderPos,
	TILE_HEIGHT,
	TILE_WIDTH,
	updateVisibleChunks
} from './core/tiles'
import { loadAllinitialAssets, PERLIN } from './core/assets'
import { getPerlinNoise } from './lib/utils/perlinNoise'

const init = async () => {
	const app = new Application()
	await app.init({
		resizeTo: window,
		antialias: false
	})
	document.body.appendChild(app.canvas)
	// @ts-ignore
	globalThis.__PIXI_APP__ = app

	const { renderBorder } = viewport
	const view = new Rectangle(
		renderBorder.x,
		renderBorder.y,
		renderBorder.width,
		renderBorder.height
	)

	await loadAllinitialAssets()

	const perlin = getPerlinNoise(PERLIN.PERLIN_GROUND_MAP)

	const worldWidth = (perlin?.width || 0) * TILE_WIDTH
	const worldHeight = (perlin?.height || 0) * TILE_HEIGHT
	viewport.world = { width: worldWidth, height: worldHeight }

	const world = new Container({
		isRenderGroup: true,
		eventMode: 'static',
		label: 'world',
		x: -worldWidth / 2,
		y: -worldHeight / 2
	})

	setInitalPrevRenderPos(world)

	app.stage.addChild(world)

	world.on('pointerdown', (ev) => handlePointerDown(ev))
	world.on('pointermove', (ev) => handlePointerMove(ev, ground, world))
	window.addEventListener('pointerup', (ev) => handlePointerUp(ev))

	const chunks = drawGroundTiles(perlin)

	const ground = new Container({ label: 'ground' })
	updateVisibleChunks(world, ground, chunks)
	world.addChild(ground)

	setCameraBorder(ground)

	app.ticker.add(() => {
		updateCameraMomentum(world, ground)

		if (hasCameraMovement() && hasMovedToNewChunk(world.x, world.y)) {
			updateVisibleChunks(world, ground, chunks)
		}

		Culler.shared.cull(world, view)
	})
}

window.addEventListener('DOMContentLoaded', init)
