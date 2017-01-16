import readline from 'readline';

const colors = [
  { name: 'red', code: 9 },
  { name: 'orange', code: 208 },
  { name: 'yellow', code: 11 },
  { name: 'green', code: 10 },
  { name: 'blue', code: 12 },
  { name: 'indigo', code: 54 },
  { name: 'violet', code: 93 },
];

const C = index => str => `\x1b[38;5;${colors[index].code}m${str}\x1b[0m`;
colors.forEach((c, i) => {
  const s = C(i)('-');
  console.log(s, s.length);
});

function NyanProgress(callback) {
  const stream = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const nyan = {
    frames: [
      ` ,------,
 |   /\\_/\\
~|__( o .o)
   ""  ""   `,
      ` ,------,
 |   /\\_/\\
~|__( o .o)
  ""  ""    `,
    ],
    complete: ` ,------,
 |   /\\_/\\
~|__( ^ .^)
   ""  ""   `,
    error: ` ,------,
 |   /\\_/\\
~|__( > .<)
   ""  ""   `,
  };

  const appendVertical = (linesOfStr, ...appendants) => {
    const result = linesOfStr.slice();

    for (let line = 0; line < result.length; line += 1) {
      for (let a = 0; a < appendants.length; a += 1) {
        result[line] += appendants[a][line];
      }
    }

    return result;
  };

  const applyColors = (rainbow) => {
    const applyByOrder = (base, char) => {
      if (char === '-') return C(base)(char);
      else if (char === '_') return C(base + 1)(char);
      return char;
    };

    return rainbow.map((line, r) => (
      line.split('')
        .map(char => applyByOrder(r * 2, char))
        .join('')
    ));
  };

  let tick = 0;

  return {
    animation: 0,
    isComplete: false,
    rainbow: '',

    start(options = {}) {
      this.curr = options.curr || 0;
      this.total = options.total || 10;
      this.width = options.width || this.total;
      this.renderThrottle = options.renderThrottle || 500;

      this.isComplete = false;

      this.rainbow = ['_-', '-_', '_-', '- ']
        .map(line => line.repeat(Math.ceil((this.width + 1) / 2)).substring(0, this.width + 1));

      readline.cursorTo(stream, 0, 0);
      readline.clearScreenDown(stream);

      this.animation = setInterval(this.animate.bind(this), this.renderThrottle);

      return this;
    },

    animate() {
      if (tick) {
        readline.cursorTo(stream, 0, 0);
      }

      const portion = this.curr / this.total;
      const len = Math.floor(portion * this.width);
      const flag = tick % nyan.frames.length;
      const cat = nyan.frames[flag].split('\n');
      const rainbow = this.rainbow.map(line => line.substring(flag, flag + len));
      this.paint = appendVertical(applyColors(rainbow), cat);

      stream.write(this.paint.join('\n'));

      tick += 1;

      if (this.curr >= this.total) {
        this.terminate();
      }
    },

    tick() {
      this.curr += 1;

      return this;
    },

    terminate() {
      clearInterval(this.animation);
      this.animation = 0;

      readline.cursorTo(stream, 0, 0);
      this.paint = appendVertical(applyColors(this.rainbow), nyan.complete.split('\n'));
      stream.write(this.paint.join('\n'));
      stream.write('\n');

      this.isComplete = true;

      if (typeof callback === 'function') {
        callback.call();
      }

      stream.close();

      return Promise.resolve();
    },
  };
}

const progress = NyanProgress();
progress.start({ total: 300, width: 50 });
const timer = setInterval(() => {
  progress.tick();

  if (progress.isComplete) {
    clearInterval(timer);
  }
}, 100);

export default NyanProgress;
