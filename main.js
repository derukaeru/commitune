import * as Tone  from "tone";

var log
var github_repo = "";

function set_github_repo(repo_link) {
  github_repo = repo_link;
}

function create_tool() {
  var synth = new Tone.synth().toDestination();
}
