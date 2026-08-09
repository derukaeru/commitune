/*
tempo: the average difference between commit times
pitch: additions / deletions
instrument: file type
*/

// yoo commiTUNES
let tones = ["C3", "D3", "E3", "G3", "A3", "C4", "D4", "E4", "G4", "A4"]

let current_sequence = null;
let active_instruments = []

let instruments = {
  js: () => {
    return new Tone.Synth().toDestination()
  },
  css: () => {
    return new Tone.AMSynth().toDestination()
  },
  html: () => {
    return new Tone.FMSynth().toDestination()
  },
  md: () => {
    return new Tone.PluckSynth().toDestination()
  },
  gd: () => {
    return new Tone.MonoSynth().toDestination()
  },
  tscn: () => {
    return new Tone.MonoSynth().toDestination()
  },
  png: () => {
    return new Tone.MembraneSynth().toDestination()
  },
  default: () => {
    return new Tone.Synth().toDestination()
  },
}

function get_extension(file) {
  const file_parts = file.split(".");
  if (file_parts.length <= 1) return "default"

  var extension = file_parts.pop().toLowerCase();
  return extension
}

function get_instrument(commit) {
  var extension
  if (commit.files.length) {
    extension = get_extension(commit.files[0])
  }
  else {
    extension = "default"
  }

  const factory = instruments[extension] || instruments.default;
  return factory();
}

// get the next pitch based on the difference between additions and deletions
function get_next_pitch_index(commit, prev_index) {
  const net = commit.additions - commit.deletions;
  let index = prev_index + (net > 0 ? 1 : net < 0 ? -1 : 0);

  return Math.max(0, Math.min(tones.length - 1, index));
}

// get tempo from commit times
function get_tempo(commits) {
  const dates = commits.map(c => new Date(c.date).getTime()).filter(t => !isNaN(t)).sort((a, b) => a - b)

  // too little dates
  if (dates.length < 2) return 100;

  const gaps = dates.slice(1).map((t, i) => t - dates[i]);
  const average_gap = (gaps.reduce((a, b) => a + b, 0) / gaps.length) / 3.6e6

  return Math.max(60, Math.min(160, 160 - average_gap * 2));
}

function create_tune() {
  if (!repo_data || repo_data.length === 0) {
    console.error("no repo data")
    return;
  }

  // dispose old playing tune
  if (current_sequence) {
    current_sequence.dispose();
  }

  active_instruments.forEach((instrument) => instrument.dispose())
  active_instruments = []

  // oldest to newest
  const commits = [...repo_data].reverse()

  Tone.Transport.bpm.value = get_tempo(commits)

  // the middle scale first
  let pitch_index = Math.floor(tones.length / 2);

  const steps = commits.map(commit => {
    pitch_index = get_next_pitch_index(commit, pitch_index)

    const instrument = get_instrument(commit)
    active_instruments.push(instrument)

    return {
      note: tones[pitch_index],
      instrument
    }
  })

  current_sequence = new Tone.Sequence((time, step) => {
    step.instrument.triggerAttackRelease(step.note, "8n", time);
  }, steps, "4n").start(0)

  Tone.start().then(() => Tone.Transport.start());
}

function stop_tune() {
  Tone.Transport.stop()
  if (current_sequence) {
    current_sequence.dispose()
    current_sequence = null
  }
}
