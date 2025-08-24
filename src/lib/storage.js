import { v4 as uuidv4 } from 'uuid'

const UID_KEY = "sx_uid"
const GRID_KEY = "sx_grid"

export function initUID() {
  let uid = localStorage.getItem(UID_KEY)
  if (!uid) {
    uid = uuidv4()
    localStorage.setItem(UID_KEY, uid)
  }
  return uid
}

export function loadGrid() {
  const json = localStorage.getItem(GRID_KEY)
  return json ? JSON.parse(json) : {}
}

export function saveGrid(grid) {
  localStorage.setItem(GRID_KEY, JSON.stringify(grid))
}
