import readline from 'readline';
import applyColors from './colors';

function nyanProgress() {
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

      const cat = nyan.frames[tick % nyan.frames.length].split('\n');
      const paint = this.draw(cat, this.message.downloading);

      stream.write(`${paint.join('\n')}\n`);

      tick += 1;
    },

    draw(cat, messages) {
      const portion = this.curr / this.total;
      const percent = Math.floor(portion * 100 > 100 ? 100 : portion * 100).toString();
      const len = Math.floor((portion > 1 ? 1 : portion) * this.width);
      const flag = tick % nyan.frames.length;
      const rainbow = this.rainbow.map(line => line.substring(flag, flag + len));

      const paint = appendVertical(
        [' ', ' ', ' ', ' '],
        applyColors(rainbow),
        cat,
      );

      const message = Array.isArray(messages) ? messages[tick % messages.length] : messages;
      const bar = `[${'='.repeat(len)}${' '.repeat(this.width - len)}] ${percent}% ${message}`;
      paint.push(bar);

      return paint;
    },

    tick(value = 1) {
      this.curr += value;

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
      const cat = nyan[isFinished ? 'complete' : 'error'].split('\n');
      const message = isFinished ? this.message.finished : this.message.error;
      const paint = this.draw(cat, message);

      if (isFinished) {
        paint[paint.length - 1] += ` in ${timeElappsed}s.\n`;
      }

      stream.write(`${paint.join('\n')}\n`);
      stream.close();

      this.isComplete = true;

      if (typeof this.callback === 'function') {
        this.callback.call();
      }
    },
  };
}

export default nyanProgress;
module.exports = nyanProgress;
