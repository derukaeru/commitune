var link_input = document.getElementById("link-input");
var tune_visualizer = document.getElementById("tune-visualizer");

var play_button = document.getElementById("play");
var stop_button = document.getElementById("stop");

var log;
var owner = "";
var repo = "";
var branch = "";

var repo_data;
let last_active_bar = null;

var accent_color = "#382b26";
var main_color = "#b8c2b9";

play_button.addEventListener("click", () => {
  play_button.style.backgroundColor = accent_color;
  play_button.style.color = main_color;

  stop_button.style.backgroundColor = main_color;
  stop_button.style.color = accent_color;

  play();
});

stop_button.addEventListener("click", () => {
  stop_button.style.backgroundColor = accent_color;
  stop_button.style.color = main_color;

  play_button.style.backgroundColor = main_color;
  play_button.style.color = accent_color;

  stop();
});

async function play() {
  try {
    await set_repo_link();

    if (repo_data.length === 0) {
      return alert("this repo has no commits")
    }
      create_tune();
    } catch (error) {
      console.error(error);
    }
}

function stop() {
  stop_tune();
}

async function set_repo_link() {
  var input_val = link_input.value;
  input_val = input_val.trim().split("/");

  if (input_val.length !== 3) {
    alert("expected format: author/repo/branch");
    throw new Error("expected format: author/repo/branch");
  }

  const [new_owner, new_repo, new_branch] = input_val;
  if (owner === new_owner && repo === new_repo && branch === new_branch) {
    return;
  }

  owner = input_val[0]
  repo = input_val[1]
  branch = input_val[2]

  repo_data = await get_repo_data()
}

async function get_repo_data() {
  if (owner.length <= 0 || repo.length <= 0 || branch.length <= 0) throw Error(`owner, repo or branch are not valid`);
  let page = 1;
  let per_page = 11;

  const list_res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=${per_page}&page=${page}`
  );

  if (!list_res.ok) {
    alert(`github API error ${list_res.status}`)
    throw new Error(`github API error ${list_res.status}`);
  }

  const commit_list = await list_res.json();
  const commits = await Promise.all(
    commit_list.map(async (c) => {
      const res = await fetch(c.url);
      const data = await res.json();

      return {
        sha: data.sha,
        date: data.commit.author.date,
        message: data.commit.message,
        additions: data.stats.additions,
        deletions: data.stats.deletions,
        files: data.files.map(f => f.filename),
      };
    })
  );

  return commits;
}

function remap(value, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

function render_bars(steps) {
  tune_visualizer.innerHTML = ""
  steps.forEach((step, i) => {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.dataset.index = i;

    var tone_index = tones.indexOf(step.note)
    var height = remap(tone_index, 0, tones.length, 4, 48)

    bar.style.height = `${height}px`
    tune_visualizer.appendChild(bar)
  })
}

function highlight_bar(index) {
  if (last_active_bar !== null) {
    last_active_bar.classList.remove("active");
  }
  const bar = document.querySelector(`.bar[data-index="${index}"]`);
  if (bar) {
    bar.classList.add("active");
    last_active_bar = bar;
  }
}

function remove_bars() {
  tune_visualizer.innerHTML = ""
}
