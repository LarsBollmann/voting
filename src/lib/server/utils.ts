import type { Proposal } from '../voting';

export function makeID(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function rankedChoiceResults(votes: string[][]) {
  const voters = votes.length;
  let winnerVotes = 0;
  let winner = '';

  try {
    while (winnerVotes <= Math.floor(voters / 2) && votes.length > 0) {
      const results: { [key: string]: number } = {};

      for (const vote of votes) {
        const firstChoice = vote[0];
        if (firstChoice in results) {
          results[firstChoice]++;
        } else {
          results[firstChoice] = 1;
        }
      }

      if (Object.keys(results).length === 0) {
        return 'No winner';
      }

      const sortedResults = Object.entries(results).sort((a, b) => b[1] - a[1]);
      winner = sortedResults[0][0];
      winnerVotes = sortedResults[0][1];

      const loser = sortedResults[sortedResults.length - 1][0];

      if (winnerVotes > Math.floor(voters / 2)) break;
      votes = votes
        .map((vote) => {
          const index = vote.findIndex((choice) => choice === loser);
          if (index === -1) return vote;
          vote.splice(index, 1);
          return vote;
        })
        .filter((vote) => vote.length > 0);
    }
  } catch (e) {
    console.log(e);
    return 'No winner';
  }
  return winner;
}

export function minMaxResult(votes: string[][], proposals: Proposal[]) {
  let winner = '';

  let highest_lowest_score = 0;
  for (const { name: x } of proposals) {
    let lowest_score = 1;
    for (const { name: y } of proposals) {
      if (x === y) continue;
      let x_wins = 0;
      let y_wins = 0;

      for (const vote of votes) {
        const x_index = vote.findIndex((choice) => choice === x);
        const y_index = vote.findIndex((choice) => choice === y);

        if (x_index < y_index) {
          x_wins++;
        } else {
          y_wins++;
        }
      }
      const score = x_wins / (x_wins + y_wins);
      if (score < lowest_score) {
        lowest_score = score;
      }
    }
    if (lowest_score > highest_lowest_score) {
      highest_lowest_score = lowest_score;
      winner = x;
    }
  }
  return winner;
}
