import readline from 'readline';
import applyColors from './colors';

function NyanProgress() {
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
~|__( x .x)
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

  let tick = 0;

  return {
    animation: 0,
    isComplete: false,
    rainbow: '',
    timeStart: 0,

    start(options = {}, callback) {
      this.curr = options.curr || 0;
      this.total = options.total || 100;
      this.width = options.width || 20;
      this.renderThrottle = options.renderThrottle || 500;
      this.message = {
        downloading: [
          'Nyaning.  ',
          'Nyaning.. ',
          'Nyaning...',
        ],
        finished: 'Nyaned',
        error: 'Something nyan wrong...',
        ...options.message,
      };
      this.callback = callback;

      this.isComplete = false;

      this.rainbow = ['_-', '-_', '_-', '- ']
        .map(line => line.repeat(Math.ceil((this.width + 1) / 2)).substring(0, this.width + 1));

      readline.cursorTo(stream, 0, 0);
      readline.clearScreenDown(stream);

      return new Promise((resolve) => {
        this.interupt = this.terminate.bind(this);
        this.timeStart = Date.now();
        this.animation = setInterval(() => {
          if (this.curr >= this.total) {
            resolve(this.terminate());
            return;
          }

          this.animate();
        }, this.renderThrottle);
      });
    },

    animate() {
      if (tick) {
        readline.cursorTo(stream, 0, 0);
      }

      const portion = this.curr / this.total;
      const percent = Math.floor(portion * 100).toString();
      const len = Math.floor(portion * this.width);
      const flag = tick % nyan.frames.length;
      const cat = nyan.frames[flag].split('\n');
      const rainbow = this.rainbow.map(line => line.substring(flag, flag + len));
      this.paint = appendVertical(
        [' ', ' ', ' ', ' '],
        applyColors(rainbow),
        cat,
      );
      const message = this.message.downloading[tick % this.message.downloading.length];
      const bar = `[${'='.repeat(len)}${' '.repeat(this.width - len)}] ${percent}% ${message}\n`;
      this.paint.push(bar);

      stream.write(this.paint.join('\n'));

      tick += 1;
    },

    tick() {
      this.curr += 1;

      return this;
    },

    terminate() {
      clearInterval(this.animation);
      this.animation = 0;
      const timeElappsed = (Date.now() - this.timeStart) / 1000;

      readline.moveCursor(stream, 0, -1);
      readline.clearLine(stream, 0);
      readline.cursorTo(stream, 0, 0);

      const isFinished = this.curr >= this.total;
      const portion = this.curr / this.total;
      const percent = Math.floor(portion * 100 > 100 ? 100 : portion * 100).toString();
      const len = Math.floor(portion * this.width);
      const rainbow = this.rainbow.map(line => line.substring(0, len));

      this.paint = appendVertical(
        [' ', ' ', ' ', ' '],
        applyColors(rainbow),
        nyan[isFinished ? 'complete' : 'error'].split('\n'),
      );

      const bar = `[${'='.repeat(len)}${' '.repeat(this.width - len)}] ${percent}% ${isFinished ? this.message.finished : this.message.error}${isFinished ? ` in ${timeElappsed}s.` : ''}\n`;
      this.paint.push(bar);
      stream.write(this.paint.join('\n'));
      stream.write('\n');
      stream.close();

      this.isComplete = true;

      if (typeof this.callback === 'function') {
        this.callback.call();
      }
    },
  };
}

const progress = NyanProgress();
progress.start({ total: 100 });
const timer = setInterval(() => {
  progress.tick();

  if (progress.isComplete) {
    clearInterval(timer);
  }
}, 100);

export default NyanProgress;
