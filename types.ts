export interface SimplifiedAlbum {
  publishTime: number
  name: string
  id: number
  alias?: string[]
  picUrl: string
}

export interface AlbumDetailResponse {
  album: {
    description: string
  }
  songs: Song[]
}

export interface Song {
  name: string
  id: number
  alia?: string[]
  dt: number // duration in milliseconds
}

export interface ProcessedAlbum {
  name: string
  id: number
  picUrl: string
  description?: string
  alias?: string[]
  dt: number // total duration of all songs in milliseconds
  date: number
  songs: Song[]
}

export type t_All = ProcessedAlbum[]
export type t_Albums = SimplifiedAlbum[]
export type t_Songs = Song[]
