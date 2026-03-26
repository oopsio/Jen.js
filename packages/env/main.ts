import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { expand as dotenvExpand } from 'dotenv-expand'

export type Env = { [key: string]: string | undefined }

let initialEnv: Env = { ...process.env }

export function loadJenEnv(dir: string = process.cwd()) {
  const mode = process.env.NODE_ENV || 'development'
  
  const envFiles = [
    `.env.${mode}.local`,
    mode !== 'test' ? '.env.local' : '', 
    `.env.${mode}`,
    '.env',
  ].filter(Boolean) as string[]

  let combinedParsed: Env = {}

  for (const file of envFiles) {
    const filePath = path.resolve(dir, file)
    
    if (fs.existsSync(filePath)) {
      const contents = fs.readFileSync(filePath, 'utf8')
      const parsed = dotenv.parse(contents)
      
      // Fixed: Just pass the parsed object. 
      // Dotenv-expand will handle the variables inside.
      const result = dotenvExpand({ parsed })
      const expanded = result.parsed || {}
      
      for (const [key, value] of Object.entries(expanded)) {
        if (!(key in combinedParsed)) {
          combinedParsed[key] = value
        }
      }
    }
  }

  for (const [key, value] of Object.entries(combinedParsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }

  return combinedParsed
}