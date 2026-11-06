// All timing for the full video, from public/voiceover.wav (narrator at 1.25x + resident + driver).
// Sentence starts/ends measured with ffmpeg silencedetect (-38 dB, >= 0.22 s).
// Word beats inside a sentence: placed by syllable count between the measured start and end (about +-0.15 s).
export const DURATION = 50.7;

export const SENTENCES = [
  { id: 'S1', start: 0.0, end: 5.22, text: 'In 2025, a town in Sweden put its church on wheels and drove it five kilometres across town.' },
  { id: 'S2', start: 5.66, end: 9.75, text: 'Kiruna sits far above the Arctic Circle, right on top of a giant iron ore mine.' },
  { id: 'S3', start: 10.28, end: 11.97, text: 'The mine built the town in 1900.' },
  { id: 'S4', start: 12.3, end: 14.2, text: 'Now it was digging under the streets.' },
  { id: 'S5', start: 14.6, end: 17.19, text: 'But the deeper it dug, the more the ground above it cracked.' },
  { id: 'S6', start: 17.55, end: 21.89, text: 'Then in 2004, the town decided to move its whole centre three kilometres east.' },
  { id: 'RES', start: 22.3, end: 25.44, text: '(Resident) The shops, fine. But not our church.' },
  { id: 'S7', start: 25.93, end: 30.06, text: 'The wooden church was built in 1912 and weighs about 670 tonnes.' },
  { id: 'S8', start: 30.44, end: 31.75, text: "You see, they didn't take it apart." },
  { id: 'S9', start: 32.06, end: 35.86, text: 'They lifted it onto steel beams and slid 224 wheels underneath.' },
  { id: 'S10', start: 36.27, end: 38.13, text: 'It crept along at half a kilometre an hour.' },
  { id: 'DRV', start: 38.63, end: 42.69, text: "(Driver) Slowly. Slowly. That's a church." },
  { id: 'S11', start: 43.16, end: 46.8, text: 'So for two days in August, crowds walked beside a church rolling through town.' },
  { id: 'S12', start: 47.31, end: 49.9, text: 'The town moved east, and this time, the church came with it.' },
];

// shot cuts (middle of the pause after the last sentence of each shot)
export const CUTS = [0, 5.44, 10.02, 14.4, 17.37, 22.1, 30.25, 36.07, 42.93, 47.06, DURATION];
// location changes get a 0.4 s dip to cream; the rest are continuous camera moves
export const DIPS = [5.44, 17.37, 22.1, 36.07];

export const B = {
  // shot 2-4 (mine cut-away)
  kiruna: 5.75, arctic: 6.9, giantMine: 9.2,
  y1900: 11.2, digging: 12.87, streets: 14.0,
  deeper: 14.97, ground: 16.26, cracked: 17.0,
  // shot 5 (town hall)
  y2004: 17.93, move: 19.44, three: 20.39, east: 21.71,
  // shot 6-7 (old church site)
  resStart: 22.3, resEnd: 25.44, y1912: 27.24, tonnes670: 28.75,
  seeApart: 30.44, lifted: 32.24, steel: 33.15, slid: 33.69, wheels224: 33.87, wheelsWord: 34.96, underneath: 35.14,
  // shot 8-10 (road)
  half: 36.99, drvStart: 38.63, drvEnd: 42.69,
  twoDays: 43.59, august: 44.23, crowds: 44.66, church11: 45.94,
  east12: 47.96, church12: 49.04, came: 49.25,
};

// talking: true while a character's line is being spoken (with small gaps at pauses)
export const talking = (t, a, b) => t > a + 0.05 && t < b - 0.05;
