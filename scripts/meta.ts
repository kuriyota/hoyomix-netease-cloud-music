import fs from 'node:fs'
import path from 'node:path'

const __dirname = import.meta.dirname as string

export const API_HOST = 'http://localhost:3000'
export const TEMP_DIR = path.join(__dirname, '../temp')
export const DATA_DIR = path.join(__dirname, '../data')
export const ALBUM_DETAILS_DIR = path.join(DATA_DIR, 'albums')
export const SONG_LYRIC_DIR = path.join(DATA_DIR, 'lyrics')
export const ALBUM_RAW_PATH = path.join(TEMP_DIR, 'album-raw.json')
export const ALBUM_RAW_DETAILS_DIR = path.join(TEMP_DIR, 'albums')
export const ALBUM_LIST_PATH = path.join(DATA_DIR, 'album.json')

/**
 * Ensures a directory exists, creates it if necessary
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}
