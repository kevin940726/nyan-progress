import readline from 'readline';

const clc = require('cli-color');

const NyanProgress = () => ({
  rainbows: [
    ['_', '-', '_', ' ', ''],
    ['-', '_', '-', ' ', ''],
  ],
  nyans: {
    frames: [
      `_,------,
-|   /\\_/\\
~|__( o .o)
   ""  ""   \n`,
      `-,------,
_|   /\\_/\\
~|__( o .o)
  ""  ""    \n`,
    ],
    complete: `_,------,
-|   /\\_/\\
~|__( ^ .^)
   ""  ""   \n`,
    error: `_,------,
-|   /\\_/\\
~|__( > .<)
   ""  ""   \n`,
  },
  rl: readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  }),

  curr: 0,
  total: 10,
  width: 10,
  interval: 500,
  animation: 0,
  complete: false,
  isRunning: false,

  init(options = {}) {
    this.curr = options.curr || 0;
    this.total = options.total || 10;
    this.width = options.width || this.total;
    this.interval = options.interval || 500;
    this.complete = false;
    this.isRunning = false;
    this.flag = 0;

    this.animation = setInterval(this.animate.bind(this), this.interval);

    return this;
  },

  animate() {
    if (this.isRunning) {
      process.stdout.write(clc.move.lines(-4));
    }

    this.isRunning = true;

    this.flag = Number(!this.flag);

    const percent = this.curr / this.total;
    const len = Math.floor(percent * this.width);

    let nyan = this.nyans.frames[this.flag].split('\n');

    if (this.curr >= this.total) {
      this.complete = true;
      nyan = this.nyans.complete.split('\n');
    }

    const paint = [].concat(...new Array(Math.ceil(len / 2) + 1).fill(this.rainbows))
      .slice(this.flag, this.flag + len)
      .concat([nyan])
      .reduce((p, cur) => p.map((line, i) => line + cur[i]))
      .join('\n');

    this.rl.write(paint);

    if (this.complete) {
      clearInterval(this.animation);
      this.animation = 0;
    }
  },

  tick() {
    this.curr += 1;
    this.animate();
  },
});

// USAGE:
// const progress = NyanProgress().init({ width: 50 });
// const timer = setInterval(() => {
//   progress.tick();
//
//   if (progress.complete) {
//     clearInterval(timer);
//
//   }
// }, 1000);

export default NyanProgress;
