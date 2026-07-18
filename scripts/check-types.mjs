import { readFileSync } from "fs"

const content = readFileSync("node_modules/@ai-sdk/react/dist/index.d.ts", "utf8")

const lines = content.split("\n")
let inUseChat = false
let braceDepth = 0

for (const line of lines) {
  if (line.includes("useChat") && line.includes("=>")) {
    inUseChat = true
    console.log("FOUND useChat at:", line.slice(0, 100))
  }
  if (inUseChat) {
    console.log(line)
    for (const c of line) {
      if (c === "{") braceDepth++
      if (c === "}") braceDepth--
    }
    if (braceDepth === 0 && line.includes("}")) {
      inUseChat = false
    }
  }
}
