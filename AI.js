document.addEventListener("DOMContentLoaded",() => {
  async function firstModel() {
    const model = tf.sequential();

    // const size = 4;
    const size = 26;
    // const size = 1;
    // const allSize = 10;
    // const allSize = 1;
    const allSize = 100;
    // const allSize = 1000;


    // model.add(tf.layers.dense({units: size, inputShape: [size]}));
    model.add(tf.layers.dense({
      units: size,
      inputShape: [size],
      activation: 'sigmoid',
    }));
    model.add(tf.layers.dense({
      units: size,
      activation: 'sigmoid',
    }));
    model.add(tf.layers.dense({
      units: 1
    }));
    // model.add(tf.layers.dense({units: size, inputShape:  [size]}));
    // model.add(tf.layers.dense({units: size, activation: 'softmax'}));
    // model.add(tf.layers.dense({units: size, activation: 'softmax'}));
    // model.add(tf.layers.dense({units: size}));

    // model.compile({loss: 'meanSquaredError', optimizer: 'sgd'}); // не работает с чилами >50

    // model.compile({loss: 'meanSquaredError', optimizer: 'momentum'});
    // model.compile({loss: 'meanSquaredError', optimizer: 'adamax'});

    // model.compile({loss: 'meanSquaredError', optimizer: 'rmsprop'}); // работает с большими числами (>50) но плохая кореляция

    // model.compile({loss: 'logLoss', optimizer: 'rmsprop'}); // Unknown loss logLoss
    // model.compile({loss: 'absoluteDifference', optimizer: 'rmsprop'}); // Unknown loss absoluteDifference
    // model.compile({loss: 'computeWeightedLoss', optimizer: 'rmsprop'}); // Unknown loss computeWeightedLoss
    // model.compile({loss: 'cosineDistance', optimizer: 'rmsprop'}); // Unknown loss cosineDistance
    // model.compile({loss: 'hingeLoss', optimizer: 'rmsprop'}); // Unknown loss hingeLoss


    model.compile({
      optimizer: 'sgd', // only <= 30
      // optimizer: tf.train.sgd(0.01),
      // optimizer: 'rmsprop',
      // loss: 'categoricalCrossentropy',
      loss: 'meanSquaredError',
      // metrics: ['accuracy']
    });

    const xsRaw = [];
    // const xsRaw = [272.5, 14, 7, 0, 2611853, 8776845, 0, 7768847, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 3, 3.141592653589793, 180];
    const xsRawSample = [272.5,  4, 7, 0, 2611853, 8776845, 0, 7768847, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 3, 3.141592653589793, 180];
    // const xsRawSample = [272.5,  4, 7, 0, 2611853, 8776845, 0, 7768847, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 3, 3.141592653589793, 180].join('-');
    // const xsRaw = [27.25, 14, 7, 0, 26.11853, 8.776845, 0, 7.768847, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 3, 3.141592653589793, 18.0];
    // const xsRaw = [27, 14, 7, 0, 2, 2, 0, 2, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 3, 3, 18];
    // const xsRaw = [272, 14, 7, 0, 261, 877, 0, 776, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 3, 3, 180];
    // const xsRaw = [2, 14, 7, 0, 26.11853, 8, 0, 7, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 3, 3, 10];
    // const xsRawSample = [2, 14, 7, 0, 26.11853, 8, 0, 7, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 3, 3, 10];
    // const xsRawSample = [2, 14, 30, 0, 26.11853, 8, 0, 7, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 3, 3, 10];

    // for (let i = 0; i < allSize - 1; i++) {

    // Заполняем рандомом
    /*
    for (let i = 0; i < allSize; i++) {
      const sample = [];
      for (let j = 0; j < size; j++) {
        sample.push(mathHelper.randomInt(0, 250));
      }
      xsRaw.push(sample);
    }
    */

    // Дублируем одну и ту же конфигурацию
    for (let i = 0; i < allSize; i++) {
      xsRaw.push(xsRawSample);
    }

    // const xs = tf.tensor2d([[1, 2, 3, 1], [4, 5, 6, 1], [7, 8, 9, 1], [7, 8, 9, 1], [7, 8, 9, 1], ], [allSize, size]); // сначала строки, потом столбцы
    // const xs = tf.tensor2d(xsRaw, [allSize, size]); // сначала строки, потом столбцы
    // const xs = tf.tensor2d(xsRaw, [allSize, size], 'float32'); // сначала строки, потом столбцы
    const xs = tf.tensor2d(xsRaw, [allSize, size]); // сначала строки, потом столбцы
    // const xs = tf.tensor2d(xsRaw, [allSize, size], 'string'); // сначала строки, потом столбцы
    // console.log(xs);

    const ysRaw = [];

    for (let i = 0; i < allSize; i++) {
      const sample = new Array(size);
      // sample[0] = mathHelper.randomInt(0, 5);
      // sample[0] = 5;
      // ysRaw.push(sample);
      ysRaw.push(5);
    }

    // const first = new Array(size);
    // first[0] = 1;
    // const ys = tf.tensor2d([[1, 0, 0, 0], [5, 0, 0, 0], [10, 0, 0, 0], [5, 0, 0, 0], [10, 0, 0, 0]], [5, 4]);
    // const ys = tf.tensor2d([first, first, first, first, first], [5, 4]);
    // const ys = tf.tensor2d(ysRaw, [allSize, size], 'float32');
    // const ys = tf.tensor2d(ysRaw, [allSize, size]);
    const ys = tf.tensor2d(ysRaw, [allSize, 1]);
    // const ys = tf.tensor2d(ysRaw, [allSize, size], 'string');
    // console.log(ys);

    console.log(xsRaw, ysRaw);

    await model.fit(xs, ys, {epochs: 500});
    // await model.fit(xs, ys, {epochs: 1500});

    /*
    const testConfig = [];
    for (let j = 0; j < size; j++) {
      testConfig.push(mathHelper.randomInt(0, 10));
    }
    */

    const testConfig = xsRawSample;

    document.getElementById('tensor-out').innerText = 'Your model predicts:\n\n' +
      // model.predict(tf.tensor2d(testConfig, [1, size]))
      model.predict(tf.tensor2d([testConfig], [1, size]))
  }
  // firstModel();
});


const aiHelper = ai = {
  starConfigList: [],
  starRatingList: [],
  model: null,
  createModel: (size) => {
    const model = tf.sequential();
    // model.add(tf.layers.dense({units: size, inputShape:  [size]}));
    // model.compile({loss: 'meanSquaredError', optimizer: 'sgd'}); // Не работает с большими числами
    // model.compile({loss: 'meanSquaredError', optimizer: 'rmsprop'}); // Не находит взаимосвязи
    // model.compile({loss: 'meanSquaredError', optimizer: 'rmsprop'}); // Не находит взаимосвязи

    model.add(tf.layers.dense({
      units: size,
      inputShape: [size],
      activation: 'sigmoid',
    }));
    model.add(tf.layers.dense({
      units: size,
      activation: 'sigmoid',
    }));
    model.add(tf.layers.dense({
      units: size,
      activation: 'sigmoid',
    }));
    model.add(tf.layers.dense({
      units: size,
      activation: 'sigmoid',
    }));
    model.add(tf.layers.dense({
      units: 1
    }));

    // model.compile({loss: 'meanSquaredError', optimizer: 'rmsprop'}); // Не находит взаимосвязи

    // model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
    model.compile({
      optimizer: tf.train.sgd(0.01),
      // optimizer: 'sgd',
      loss: 'meanSquaredError'
    });

    return model;
  },
  fit: async (xsRaw, ysRaw, model) => {
    const allSize = xsRaw.length,
      size = (appConfig.extraStarCountMax + 1) * appConfig.packedConfigSize;

    const xs = tf.tensor2d(xsRaw, [allSize, size]); // Сначала строки потом столбцы
    const ys = tf.tensor2d(ysRaw, [allSize, 1]);

    // await model.fit(xs, ys, {epochs: 500});
    // await model.fit(xs, ys, {epochs: 1500});
    await model.fit(xs, ys, {epochs: 5000});
    console.log('fit up');
  },
  predict: (xs, model) => {
    let result = model.predict(tf.tensor(xs, [1, xs.length]));
    // console.log(result);
    // console.log(result.toString());
    return result;
  },
  predictAll: (starList, model = ai.model) => {
    starList.forEach(star => {
      const predictRaw = ai.predict(star.packConfigList().flat(), model);
      const aiBeautyRating = predictRaw.toString().match(/\d+\.*\d*/iu)[0];
      // console.log(aiBeautyRating);
      star.aiBeautyRating = aiBeautyRating;
      star.drawBeautyRatings();
    });
  },
  save: async (model) => {
    // await model.save('localstorage://my-model-1');
    await model.save('indexeddb://my-model-1');
  },
  load: async () => {
    // ai.model = await tf.loadLayersModel('localstorage://my-model-1');
    // ai.model = await tf.loadModel('localstorage://my-model-1');
    ai.model = await tf.loadModel('indexeddb://my-model-1');
  }
};
