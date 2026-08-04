var link_input = document.getElementById("link-input");

var play_button = document.getElementById("play");
var stop_button = document.getElementById("stop");

var log;
var owner = "";
var repo = "";
var branch = "";

play_button.addEventListener("click", () => {
  play_button.style.backgroundColor = "darkseagreen"
  play_button.style.color = "#ffffee"

  stop_button.style.backgroundColor = "#ffffee"
  stop_button.style.color = "darkseagreen"
});

stop_button.addEventListener("click", () => {
  stop_button.style.backgroundColor = "darkseagreen"
  stop_button.style.color = "#ffffee"

  play_button.style.backgroundColor = "#ffffee"
  play_button.style.color = "darkseagreen"
});

function set_github_repo() {
  var input_val = link_input.value;
  input_val = input_val.trim().split("/");

  owner = input_val[0]
  repo = input_val[1]
  branch = input_val[2]
}

async function verify_repo(author, repo, branch) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`);

  if (res.status === 404) {
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (repoRes.status === 404) {
        return { valid: false, error: `repo "${owner}/${repo}" is not found)` };
      }
      return { valid: false, error: `branch "${branch}" of this repo is not found` };
    }

    if (!res.ok) {
      return { valid: false, error: `github API error: ${res.status}` };
    }

    return { valid: true };
}

async function get_commit_history() {
  if (owner.length <= 0 || repo.length <= 0 || branch.length <= 0) return;

  var commits = [];
  let page = 1;
  let per_page = 9;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=${per_page}&page=${page}`
  );

  if(!res.ok) {
    throw new Error(`github API error ${res.status}`);
  }

  const data = await res.json();
  commits.push(...data);
}

function get_commit_stats() {

}
