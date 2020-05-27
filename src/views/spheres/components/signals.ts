import {Profile} from "@/models/Profile";

export type SignalMessage = {
  t: 'moved',
  id?: string,
  x: number,
  y: number
} | {
  t: 'youtube-created',
  id: string,
  vid: string,
  x: number,
  y: number
} | {
  t: 'youtube-destroy',
  id: string
} | {
  t: 'youtube-sync',
  id: string,
  s: 'play' | 'pause',
  pos: number
} | {
  t: 'image-created',
  id: string,
  url: string,
  naturalWidth: number,
  naturalHeight: number,
  width: number,
  height: number,
  x: number,
  y: number
} | {
  t: 'image-changed',
  id: string,
  width: number,
  height: number
} | {
  t: 'image-destroy',
  id: string
} | {
  t: 'banned',
  token: string
} | {
  t: 'admin-muted',
  token: string,
  active: boolean
} | {
  t: 'admin-unmuted',
  token: string,
  active: boolean
} | {
  t: 'ready',
  profile: Profile
} | {
  t: 'profile',
  profile: Profile
}
