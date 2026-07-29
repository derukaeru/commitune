import * as Tone from "tone";
import { execSync } from 'child_process';

const log = execSync('git log --numstat --pretty=format:"%H|%an|%ad|%s"', {
  cwd: '/path/to/repo',
  encoding: 'utf-8'
});
var github_repo = ""

function set_github_repo(repo_link) {
  github_repo = repo_link;
}

function create_tool() {
  var synth = new Tone.synth().toDestination();
}
