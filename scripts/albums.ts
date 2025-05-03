import { AlbumDetailResponse, SimplifiedAlbum } from '../types.ts'
import {
  ALBUM_LIST_PATH,
  ALBUM_RAW_PATH,
  API_HOST,
  ensureDirectoryExists,
  ALBUM_RAW_DETAILS_DIR
} from './meta.ts'
import fs from 'node:fs'
import path from 'node:path'

export interface AlbumRawResponse {
  hotAlbums: Array<{
    name: string
    id: number
    alias: string[]
    picUrl: string
    publishTime: number
  }>
}

/**
 * Fetches all albums for a specific artist and saves raw data
 */
export async function fetchArtistAlbums(): Promise<void> {
  console.log('Fetching artist albums...')

  // Fetch raw album data from API
  const response = await fetch(
    `${API_HOST}/artist/album?id=12487174&limit=1000`
  )
  const albumData: AlbumRawResponse = await response.json()

  // Save raw response
  fs.writeFileSync(ALBUM_RAW_PATH, JSON.stringify(albumData, null, 2))

  // Simplify album data
  const simplifiedAlbums: SimplifiedAlbum[] = albumData.hotAlbums.map(
    (album) => ({
      name: album.name,
      id: album.id,
      alias: album.alias.length ? album.alias : undefined,
      picUrl: album.picUrl,
      publishTime: album.publishTime // Added for completeness
    })
  )

  // Save simplified album list
  fs.writeFileSync(ALBUM_LIST_PATH, JSON.stringify(simplifiedAlbums, null, 2))

  // Fetch details for each album
  console.log('Fetching individual album details...')
  for (const [index, album] of simplifiedAlbums.entries()) {
    await fetchAndSaveAlbumDetails(album, index + 1, simplifiedAlbums.length)
  }
}

/**
 * Fetches and saves details for a single album
 */
async function fetchAndSaveAlbumDetails(
  album: SimplifiedAlbum,
  current: number,
  total: number
): Promise<void> {
  console.log(
    `[${current}/${total}] Fetching album: ${album.id} - ${album.name}`
  )

  const response = await fetch(`${API_HOST}/album/?limit=1000&id=${album.id}`)
  const albumDetail: AlbumDetailResponse = await response.json()

  ensureDirectoryExists(ALBUM_RAW_DETAILS_DIR)

  const albumFilePath = path.join(ALBUM_RAW_DETAILS_DIR, `${album.id}.json`)
  fs.writeFileSync(albumFilePath, JSON.stringify(albumDetail, null, 2))
}
