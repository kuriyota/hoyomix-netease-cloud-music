export interface RawLyrics {
  [timestamp: number]: string
}

export interface ProcessedLyricItem {
  time: number
  lyric: string
  translation: string
  romaji: string
}

/**
 * Parses lyrics string into an object with timestamps as keys
 * @param lyrics - The lyrics string to parse
 * @returns Object with timestamps as keys and lyrics as values
 */
function parseLyrics(lyrics: string | undefined): RawLyrics {
  const parsedLyrics: RawLyrics = {}

  if (!lyrics) {
    return parsedLyrics
  }

  const lines = lyrics.trim().split('\n')

  for (const line of lines) {
    const timeMatch = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\]/)

    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10)
      const seconds = parseInt(timeMatch[2], 10)
      const milliseconds = parseInt(timeMatch[3], 10)
      const totalMilliseconds = minutes * 60000 + seconds * 1000 + milliseconds

      const lyricText = line.replace(timeMatch[0], '').trim()
      parsedLyrics[totalMilliseconds] = lyricText
    }
  }

  return parsedLyrics
}

/**
 * Merges raw lyrics with translations and romaji versions
 * @param rawLyrics - Original lyrics
 * @param translatedLyrics - Translated lyrics
 * @param romajiLyrics - Romaji version of lyrics
 * @returns 按时间戳排序的歌词数组
 */
function mergeLyrics(
  rawLyrics: RawLyrics,
  translatedLyrics: RawLyrics,
  romajiLyrics: RawLyrics
): ProcessedLyricItem[] {
  const mergedLyrics: ProcessedLyricItem[] = []

  // 获取所有唯一时间戳并排序
  const allTimestamps = new Set<number>([
    ...Object.keys(rawLyrics).map(Number),
    ...Object.keys(translatedLyrics).map(Number),
    ...Object.keys(romajiLyrics).map(Number)
  ])

  const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b)

  for (const timestamp of sortedTimestamps) {
    const isEmpty =
      !rawLyrics[timestamp] &&
      !translatedLyrics[timestamp] &&
      !romajiLyrics[timestamp]

    if (!isEmpty) {
      mergedLyrics.push({
        time: timestamp,
        lyric: rawLyrics[timestamp] || '',
        translation: translatedLyrics[timestamp] || '',
        romaji: romajiLyrics[timestamp] || ''
      })
    }
  }

  return mergedLyrics
}

/**
 * Parses and processes lyrics from the provided JSON structure
 * @param data - 包含各版本歌词的数据源
 * @returns 处理后的歌词数组
 */
export function parseAndProcessLyrics(data: {
  lrc: { lyric: string }
  tlyric: { lyric: string }
  romalrc: { lyric: string }
}): ProcessedLyricItem[] {
  const rawLyrics = parseLyrics(data.lrc.lyric)
  const translatedLyrics = data.tlyric ? parseLyrics(data.tlyric.lyric) : {}
  const romajiLyrics = data.romalrc ? parseLyrics(data.romalrc.lyric) : {}
  return mergeLyrics(rawLyrics, translatedLyrics, romajiLyrics)
}
