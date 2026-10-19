/**
 * data/palettes/room.js
 * Purpose: the shared palette for the room theme (wall, floor, trim, table)
 *          plus every colorway that recolors it.
 * Inputs:  none (pure data)
 * Outputs: ROOM_PALETTE, WALL_COLORS, WALLPAPER_COLORS, TRIM_COLORS, TABLE_COLORS
 *
 * Slot layout (sprite grids use base-32 digits: 0-9 then a-v):
 *   0-3   ramp P  dark -> light   (primary: wood, trim, wallpaper marks)
 *   4-7   ramp S  dark -> light   (secondary: wallpaper accents)
 *   8-b   ramp N  dark -> light   (floor)
 *   c-f   ramp W  dark -> light   (spare warm neutrals)
 *   g     ink     h  white
 * A colorway swaps whole ramps, so any sprite using a ramp can be recolored.
 */
import { ramp, colorway } from '../../utils/palette.js';

export const ROOM_PALETTE = {
  id: 'room',
  colors: [
    '#6b4a35', '#8f6847', '#b78b5c', '#dcb887', // 0-3  P (oak)
    '#46634f', '#5f8266', '#86a88a', '#b5d0b0', // 4-7  S (sage)
    '#4e3f3d', '#6e5a52', '#8f776a', '#b09a8a', // 8-b  N (floor)
    '#c8b79c', '#e0d2b8', '#f0e6d0', '#faf3e3', // c-f  W
    '#241b2b', '#fffaf0',                       // g ink, h white
  ],
};

export const WALL_COLORS = [
  colorway('cream', 'Cream', ramp(0, ['#b9a98b', '#d4c6a8', '#eadfc6', '#f6eedb'])),
  colorway('sage', 'Sage', ramp(0, ['#6f8a74', '#8aa58b', '#a9c2a4', '#c9dcc0'])),
  colorway('dusty-blue', 'Dusty blue', ramp(0, ['#5f7a8e', '#7d98ab', '#9db6c6', '#c0d3dd'])),
  colorway('blush', 'Blush', ramp(0, ['#b98a88', '#d0a5a0', '#e3bfb8', '#f1d8d0'])),
  colorway('honey', 'Honey', ramp(0, ['#b98a2e', '#d3a33f', '#e5bd5c', '#f1d489'])),
  colorway('lavender', 'Lavender', ramp(0, ['#7d6e9c', '#9a8cb8', '#b5a9cf', '#d0c8e3'])),
  colorway('charcoal', 'Charcoal', ramp(0, ['#2c3138', '#3b424b', '#4d565f', '#66707a'])),
];

export const WALLPAPER_COLORS = [
  colorway('sage', 'Sage', { ...ramp(0, ['#46634f', '#5f8266', '#86a88a', '#b5d0b0']), ...ramp(4, ['#d8c9a0', '#e6d9b6', '#f0e6cb', '#faf3e0']) }),
  colorway('cream', 'Cream', { ...ramp(0, ['#b8a88a', '#cdbd9e', '#e3d6b8', '#f2e8cf']), ...ramp(4, ['#a9b79a', '#bccaad', '#d0dcc2', '#e2ecd7']) }),
  colorway('navy', 'Navy', { ...ramp(0, ['#1f2f4a', '#2f4568', '#47628a', '#6f8db3']), ...ramp(4, ['#e8c26a', '#f0d38a', '#f7e3ac', '#fcefc9']) }),
  colorway('rose', 'Rose', { ...ramp(0, ['#8a4a58', '#a85f6c', '#c9808a', '#e3a8ae']), ...ramp(4, ['#e8cfb4', '#f1ddc6', '#f7e8d6', '#fcf3e8']) }),
  colorway('ink', 'Ink', { ...ramp(0, ['#14161c', '#232730', '#3a404c', '#565d6b']), ...ramp(4, ['#c9a24a', '#dcb862', '#ebce85', '#f5e1ac']) }),
];

export const TRIM_COLORS = [
  colorway('white', 'White', ramp(0, ['#c9c1b2', '#e0d9ca', '#f1ebdd', '#fdf9ee'])),
  colorway('oak', 'Oak', ramp(0, ['#6b4a35', '#8f6847', '#b78b5c', '#dcb887'])),
  colorway('walnut', 'Walnut', ramp(0, ['#3d2a20', '#5a3d2e', '#7a5640', '#9d7358'])),
  colorway('black', 'Black', ramp(0, ['#0f1114', '#1a1d23', '#2b3039', '#434a56'])),
  colorway('sage', 'Sage', ramp(0, ['#46634f', '#5f8266', '#86a88a', '#b5d0b0'])),
  colorway('navy', 'Navy', ramp(0, ['#1f2f4a', '#2f4568', '#47628a', '#6f8db3'])),
];

export const TABLE_COLORS = [
  colorway('oak', 'Oak', ramp(0, ['#6b4a35', '#8f6847', '#b78b5c', '#dcb887'])),
  colorway('walnut', 'Walnut', ramp(0, ['#3d2a20', '#5a3d2e', '#7a5640', '#9d7358'])),
  colorway('whitewash', 'Whitewash', ramp(0, ['#a39a8a', '#c4bcab', '#e2dccd', '#f5f1e6'])),
  colorway('ebony', 'Ebony', ramp(0, ['#0f1114', '#1a1d23', '#2b3039', '#434a56'])),
  colorway('moss', 'Moss', ramp(0, ['#34503f', '#4a6b53', '#678a6c', '#8fb08f'])),
  colorway('slate', 'Slate blue', ramp(0, ['#3d4f66', '#546b88', '#7390ad', '#9ab3c9'])),
  colorway('clay', 'Clay', ramp(0, ['#7a3f2e', '#9a5640', '#b87257', '#d49a7e'])),
  colorway('chrome', 'Chrome', ramp(0, ['#5d6772', '#8c97a3', '#bcc6d0', '#eef3f7'])),
  colorway('brass', 'Brass', ramp(0, ['#7a5a1e', '#a67c2a', '#d1a443', '#efd27a'])),
];
