var link_input = document.getElementById("link-input");

var play_button = document.getElementById("play");
var stop_button = document.getElementById("stop");

var log;
var owner = "";
var repo = "";
var branch = "";

var repo_data;

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
      create_tune();
    } catch (error) {
      console.error(error);
    }
}

function stop() {

}

async function set_repo_link() {
  var input_val = link_input.value;
  input_val = input_val.trim().split("/");

  if (input_val.length !== 3) {
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

  if(!list_res.ok) {
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
