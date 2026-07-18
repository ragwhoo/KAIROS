import { writeFileSync } from "fs"
import { createCanvas } from "canvas"

const sizes = [192, 512]
const dir = "public/icons"

for (const size of sizes) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext("2d")

  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, "#7D39EB")
  grad.addColorStop(1, "#C6FF33")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = "#000"
  const fontSize = Math.round(size * 0.45)
  ctx.font = `bold ${fontSize}px sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("K", size / 2, size / 2 + 2)

  const buf = canvas.toBuffer("image/png")
  writeFileSync(`${dir}/icon-${size}.png`, buf)
  console.log(`Created icon-${size}.png (${size}x${size})`)
}
