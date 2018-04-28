// Main Entry Point:
document.addEventListener("DOMContentLoaded", function(event) {
  let pixelSize = 12;
  let roundDelay = 200;
  let chanceOfLife = .1;
  let numberOfSims = 2;

  let container = document.getElementById('container');
  let containerWidth = window.innerWidth * .90;
  let containerHeight = window.innerHeight * .90;
  let cols = containerWidth / (2 * pixelSize);
  let rows = containerHeight /  pixelSize;
  container.style.height = containerHeight + 'px';
  container.style.width = containerWidth + 'px';

  let ruleSets = [];
  for(let i = 1; i < 4; i++) {
    for (let j = 1; j < 4; j++) {
      for (let k = 1; k < 4; k++) {
        ruleSets.push([i, j, k]);
      }
    }
  }

  for (let i = 0; i < numberOfSims; i++) {
    let [lifeStyle, deathStyle] = randomColorPair();
    let sim = new Simulation(rows, cols, pixelSize, roundDelay, chanceOfLife)
    let ruleIndex = Math.floor(Math.random() * ruleSets.length);


    sim.grid.forEach((row) => {
      row.forEach((entity) => {
        entity.lifeStyle = lifeStyle;
        entity.deathStyle = deathStyle;
        entity.update = generateUpdateFunction(...ruleSets[ruleIndex]);
      });
    });

    container.append(sim.canvas);
    sim.advanceRound();
    sim.repaint();
    sim.start();


    // Now add 10% "terminators" to the rules
    // And 30% "Rebirths"
    let n = ruleSets.length;
    for(let i = 0; i < n / 10; i++) {
      ruleSets.push([4, 3, 6]);
      ruleSets.push([2, 0, 5])
      ruleSets.push([3, 0, 8])
      ruleSets.push([4, 1, 9])
    }

    // Set this sim to reset it's rules occasionally!
    let waitPeriod = (Math.floor(Math.random() * 5000)) + 5000;
    setInterval(() => {
      waitPeriod = (Math.floor(Math.random() * 5000)) + 5000;
      let [lifeStyle, deathStyle] = randomColorPair();
      let rules = ruleSets[rand(0, ruleSets.length - 1)];

      console.log(rules);
      sim.grid.forEach((row) => {
        row.forEach((entity) => {
          entity.lifeStyle = lifeStyle;
          entity.deathStyle = deathStyle;
          entity.update = generateUpdateFunction(...rules);
        });
      });
    }, waitPeriod);
  }
});

function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min));
}

function randomColorPair() {
  let h = rand(1, 360);
  let comp = (h + rand(90, 270) % 360)

  return [
    `hsl(${h}, 100%, 60%)`,
    `hsl(${comp}, 100%, 60%)`
  ]
}

function generateUpdateFunction(underpopulation, reproduction, survive) {
  return function randomUpdate(neighbors) {
    let sum = 0;
    let alive = this.alive;

    for(let n of neighbors){
      if(n.alive && n !== this) sum++;
    }


    if(alive) {
      if(sum < underpopulation){
        alive = false;
      }
      else if(sum <= survive) {
        alive = true;
      }
      else {
        alive = false;
      }
    }
    else if (sum === reproduction) {
      alive = true;
    }

    return new SimEntity(alive, this.lifeStyle, this.deathStyle, randomUpdate);
  }
}