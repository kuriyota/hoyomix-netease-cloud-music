import path from 'node:path'
import { ProcessedAlbum } from '../types.ts'
import { API_HOST, DATA_DIR } from './meta.ts'
import ProgressBar from 'npm:progress'
import { parseAndProcessLyrics } from './parser-lyric.ts'

export async function processLyrics() {
  const albumList: ProcessedAlbum[] = JSON.parse(
    await Deno.readTextFile(path.join(DATA_DIR, 'all.json'))
  )
  const songs = new Set<number>()
  const songsName = new Map<number, string>()
  for (const album of albumList) {
    for (const song of album.songs) {
      songs.add(song.id)
      songsName.set(song.id, song.name)
    }
  }
  const existingLyrics = await getExistingLyrics()
  const needDownload = new Set<number>()
  for (const song of songs) {
    if (!existingLyrics.has(song)) {
      needDownload.add(song)
    }
  }
  console.log(`Existing lyrics: ${existingLyrics.size}`)
  console.log(`Length of all songs: ${songs.size}`)
  console.log(`Need to download ${needDownload.size} lyrics`)
  const progress = new ProgressBar(
    '[:bar] :percent in :etas s | id : :id | name : :name',
    {
      total: songs.size,
      width: 50
    }
  )
  progress.tick(existingLyrics.size, { id: 'Start', name: 'Start' })
  for (const song of needDownload) {
    await downloadLyrics(song)
    progress.tick({
      id: song,
      name: songsName.get(song) || 'Unknown'
    })
  }
}

export async function downloadLyrics(id: number) {
  const url = `${API_HOST}/lyric/?id=${id}`
  const res = await fetch(url)
  if (res.status === 200) {
    const data = await res.json()
    await Deno.writeTextFile(
      path.join(DATA_DIR, 'lyrics', `${id}.json`),
      JSON.stringify(parseAndProcessLyrics(data), null, 2)
    )
  }
}

async function getExistingLyrics() {
  const files = Deno.readDir(path.join(DATA_DIR, 'lyrics'))
  const lyrics = new Set<number>()
  for await (const file of files) {
    if (file.isFile) {
      lyrics.add(Number(file.name.slice(0, -5)))
    }
  }
  return lyrics
}
