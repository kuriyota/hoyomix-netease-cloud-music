import fs from 'node:fs'
import path from 'node:path'
import {
  AlbumDetailResponse,
  ProcessedAlbum,
  SimplifiedAlbum
} from '../types.ts'
import {
  SONG_LYRIC_DIR,
  ALBUM_LIST_PATH,
  ALBUM_RAW_DETAILS_DIR,
  DATA_DIR,
  ALBUM_DETAILS_DIR,
  ensureDirectoryExists
} from './meta.ts'

/**
 * Processes the raw song data into a more usable format
 */
export async function processSongsData() {
  console.log('Processing songs data...')

  ensureDirectoryExists(ALBUM_DETAILS_DIR)

  // Load album list
  const albumList: SimplifiedAlbum[] = JSON.parse(
    fs.readFileSync(ALBUM_LIST_PATH, 'utf-8')
  )

  const processedAlbums: ProcessedAlbum[] = []

  for (const [index, album] of albumList.entries()) {
    console.log(
      `Processing album ${index + 1}/${albumList.length}: ${album.name}`
    )

    const albumWithSongs = createProcessedAlbumStructure(album)
    const albumDetail = loadAlbumDetails(album.id)

    // Add description if available
    if (albumDetail.album.description) {
      albumWithSongs.description = albumDetail.album.description
    }

    // Process songs
    processAlbumSongs(albumWithSongs, albumDetail)

    Deno.writeTextFile(
      path.join(ALBUM_DETAILS_DIR, `${album.id}.json`),
      JSON.stringify(albumWithSongs, null, 2)
    )

    processedAlbums.push(albumWithSongs)
  }
  Deno.writeTextFile(
    path.join(DATA_DIR, 'all.json'),
    JSON.stringify(processedAlbums, null, 2)
  )
}

/**
 * Creates the basic structure for a processed album
 */
function createProcessedAlbumStructure(album: SimplifiedAlbum): ProcessedAlbum {
  return {
    name: album.name,
    id: album.id,
    picUrl: album.picUrl,
    alias: album?.alias,
    date: album.publishTime,
    dt: 0,
    songs: [],
    description: undefined
  }
}

/**
 * Loads album details from file
 */
function loadAlbumDetails(albumId: number): AlbumDetailResponse {
  const rawAlbumData = fs.readFileSync(
    path.join(ALBUM_RAW_DETAILS_DIR, `${albumId}.json`),
    'utf-8'
  )
  return JSON.parse(rawAlbumData)
}

/**
 * Processes songs for an album and calculates total duration
 */
function processAlbumSongs(
  album: ProcessedAlbum,
  detail: AlbumDetailResponse
): void {
  let totalDuration = 0

  for (const song of detail.songs) {
    album.songs.push({
      name: song.name,
      id: song.id,
      alia: song.alia,
      dt: song.dt
    })
    totalDuration += song.dt
  }

  album.dt = totalDuration
}
