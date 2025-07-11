
import {
  SONG_LYRIC_DIR,
  DATA_DIR,
  ensureDirectoryExists,
  TEMP_DIR
} from './scripts/meta.ts'
import { processSongsData } from './scripts/songs.ts'
import { fetchArtistAlbums } from './scripts/albums.ts'
import { processLyrics } from './scripts/lyrics.ts'

/**
 * Main execution function
 */
async function main(): Promise<void> {
  ensureDirectoryExists(TEMP_DIR)
  ensureDirectoryExists(DATA_DIR)
  ensureDirectoryExists(SONG_LYRIC_DIR)

  const mode = Deno.args[0]

  console.log(`Mode: ${mode}`)
  switch (mode) {
    case 'albums':
      await fetchArtistAlbums()
      break
    case 'songs':
      await processSongsData()
      break
    case 'lyrics':
      await processLyrics()
      break
  }
}

// Execute the main function
main()
