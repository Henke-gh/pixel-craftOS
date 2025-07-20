import { Sprite } from 'pixi.js'
import { TILE_HEIGHT, TILE_WIDTH, TILE_WIDTH_HALF } from './tiles'
import { ASSETS } from './assets'
import { getWaterTextureFromPerlin, isTileWater } from './water'
import { getPerlinAroundCell } from '../lib/utils/perlinNoise'

type GroundSpriteData = {
	xPosTile: number
	yPosTile: number
	perlin: number[][]
	row: number
	col: number
}

export const createGroundSprite = (data: GroundSpriteData) => {
	const { xPosTile, yPosTile, perlin, row, col } = data

	const x = xPosTile - TILE_WIDTH_HALF
	const y = yPosTile

	const sprite = new Sprite({
		width: TILE_WIDTH,
		height: TILE_HEIGHT * 2, // Dubble the height since we have walls on some block but this does not effect the position only the texture
		x: x,
		y: y
	})

	if (ASSETS.BLOCKS) {
		sprite.texture = ASSETS.BLOCKS.animations['grass'][0]

		if (isTileWater(perlin[row][col])) {
			const perlinArea = getPerlinAroundCell(xPosTile, yPosTile)
			const { water, key } = getWaterTextureFromPerlin(perlinArea)

			// We have set the staged app background to the same color as the water so if the tile is the default water with no border then we can just skip rendering it and use the background instea insteadd
			if (key === 'water') {
				return null
			}

			sprite.texture = water
		}
	}

	return sprite
}
