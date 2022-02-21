class Mutator {
  config;

  constructor(_config = {}) {
    // console.log(_config);
    this.config = _config;
    this.doMutation = this.doMutation.bind(this);
    // console.log(this.config);
  }

  sign() {
    return mh.randomInt(0, 1) ? 1 : -1;
  }
  deltaInt() {
    return mh.randomInt(0, 1);
  }
  deltaFloat() {
    return mh.randomInt(0, 10) / 100;
  }

  doMutation(param) {
    // console.log(this, param);

    if (!param.hasOwnProperty('type')) {
      return Object.keys(param).forEach((key) => {
        // console.log(key, param[key]);
        this.doMutation(param[key], this.config);
        // console.log(this);
      });
    }

    const deltaInt = () => { return mh.randomInt(0, 1); },
      deltaFloat = () => { return mh.randomInt(0, 10) / 100; },
      doBoolChange = () => { return mh.randomInt(1, 100) >= 95 },
      sign = () => { return mh.randomInt(0, 1) ? 1 : -1; }
    ;

    // console.log(deltaInt(), deltaFloat, deltaColor, boolValue);
    // console.log(param);

    let newValue,
      doChanceMutation = true;

    if (param.hasOwnProperty('mutationChance')) {
      let mutationChance = param.mutationChance;

      mutationChance = mutationChance > 100 ? 100 : mutationChance;

      if (mutationChance < 100) {
        const randomInt = mh.randomInt(1, 100);
        if (mutationChance >= 1 && randomInt > mutationChance) {
          doChanceMutation = false;
          // console.log(`break by random ${randomInt} > ${mutationChance}`);
        }

        if (mutationChance < 1) {
          const degree = mutationChance.toString().split('0').length - 1,
            maxInt = 10 ** degree,
            intChance = mutationChance * maxInt,
            randomInt = mh.randomInt(1, maxInt);

          if (randomInt > intChance) {
            doChanceMutation = false;
            // console.log(`break by random ${randomInt} > ${intChance} (${mutationChance}, ${maxInt})`);
          }
          else {
            // console.log(`doMutation by random ${randomInt} <= ${intChance} (${mutationChance}, ${maxInt})`);
          }
        }
      }
    }

    switch (param.type) {
      case paramType.int:
        if (!doChanceMutation) break;
        newValue = param.value + sign() * deltaInt();
        if (newValue > param.max || newValue < param.min) break;
        param.value = newValue;
        break;
      case paramType.float:
        if (!doChanceMutation) break;
        const delta = param.hasOwnProperty('delta') ? param.delta : deltaFloat();
        newValue = param.value + sign() * delta;
        if (newValue > param.max || newValue < param.min) break;
        param.value = newValue;
        // param.value = 60;
        // console.log(deltaFloat(), newValue);
        break;
      case paramType.point:
        // console.log(this, param);
        if (!(this.config.hasOwnProperty('mutatePoint') &&
          this.config.mutatePoint
        )) {
          break;
        }
        // console.log(param);
        let newX = param.x + sign() * deltaInt() * 400,
          newY = param.y + sign() * deltaInt() * 400;

        // console.log('new');
        // console.log(param.x, param.y);
        // console.log(newX, newY);
        param.x = newX;
        param.y = newY;
        break;
      case paramType.bool:
        // console.log('-' + param.value);
        param.value = doBoolChange();
        // param.value = false;
        // console.log('+' + param.value);
        break;
      case paramType.color:
        // this.mutateColorV1(param); // Без нормализации. Деградация в чёрный
        // this.mutateColorV2(param); // С нормализацией. Деградация в жёлтый
        // this.mutateColorV3(param); // Цвет как одно число. Деградация в синий
        // this.mutateColorV4(param); // Без нормализации. Деградация в розовый
        // this.mutateColorV5(param); // Зацикливаем цвет. Оптимизация вычисления
        // this.mutateColorV6(param); // Зацикливаем цвет. Дробные приращения
        this.mutateColorV7(param); // Меняем только одну составляющую.
        // this.mutateColorV8(param); // Округляем дельту до целого. Деградация в чёрный
        break;
    }
    return param;
  }

  mutateColorV1(param) {
    let color = param.value,
      blue = color & 0xFF,
      green = Math.round((color & 0xFF00) / 0x00FF),
      red = Math.round((color & 0xFFFF00) / 0x00FFFF)
    ;

    // console.log('start color mutation');
    // console.log(color.toString(16));

    const normalizeColor = (rawColor) => {
      if (rawColor < 0x0) rawColor = 0;
      if (rawColor > 0xFF) rawColor = 0xFF;
      return rawColor;
    };

    // let multiple = 10;
    let multiple = 1;

    blue += this.sign() * this.deltaInt() * multiple;
    red += this.sign() * this.deltaInt() * multiple;
    green += this.sign() * this.deltaInt() * multiple;

    // red = normalizeColor(red);
    // green = normalizeColor(green);
    // blue = normalizeColor(blue);

    // console.log(red, green, blue);

    red = red.toString(16).toUpperCase().padStart(2, '0');
    green = green.toString(16).toUpperCase().padStart(2, '0');
    blue = blue.toString(16).toUpperCase().padStart(2, '0');

    // console.log(red, green, blue, blue.toString(16)[0] * 1);

    const newColor =
      parseInt('0x' + red.toString(16)[0]) * 16**5 +
      parseInt('0x' + red.toString(16)[1]) * 16**4 +
      parseInt('0x' + green.toString(16)[0]) * 16**3 +
      parseInt('0x' + green.toString(16)[1]) * 16**2 +
      parseInt('0x' + blue.toString(16)[0]) * 16**1 +
      parseInt('0x' + blue.toString(16)[1]) * 16**0;

    // console.log(red, green, blue);
    // console.log(newColor.toString(16));
    // console.log('stop color mutation');

    let newAlpha = param.alpha + this.sign() * this.deltaFloat();

    if (newColor < 0x0 || newColor > 0xFFFFFF) return;
    if (newAlpha < .35 || newAlpha > 1) return;

    param.value = newColor;
    param.alpha = newAlpha;
  }

  mutateColorV2(param) {
    let color = param.value,
      blue = color & 0xFF,
      green = Math.round((color & 0xFF00) / 0x00FF),
      red = Math.round((color & 0xFFFF00) / 0x00FFFF)
    ;

    // console.log('start color mutation');
    // console.log(color.toString(16));

    const normalizeColor = (rawColor) => {
      if (rawColor < 0x0) rawColor = 0;
      if (rawColor > 0xFF) rawColor = 0xFF;
      return rawColor;
    };

    // let multiple = 10;
    let multiple = 1;

    blue += this.sign() * this.deltaInt() * multiple;
    red += this.sign() * this.deltaInt() * multiple;
    green += this.sign() * this.deltaInt() * multiple;

    red = normalizeColor(red);
    green = normalizeColor(green);
    blue = normalizeColor(blue);

    red = red.toString(16).toUpperCase().padStart(2, '0');
    green = green.toString(16).toUpperCase().padStart(2, '0');
    blue = blue.toString(16).toUpperCase().padStart(2, '0');

    const newColor =
      parseInt('0x' + red.toString(16)[0]) * 16**5 +
      parseInt('0x' + red.toString(16)[1]) * 16**4 +
      parseInt('0x' + green.toString(16)[0]) * 16**3 +
      parseInt('0x' + green.toString(16)[1]) * 16**2 +
      parseInt('0x' + blue.toString(16)[0]) * 16**1 +
      parseInt('0x' + blue.toString(16)[1]) * 16**0;

    let newAlpha = param.alpha + this.sign() * this.deltaFloat();

    if (newColor >= 0x0 && newColor <= 0xFFFFFF)
      param.value = newColor;

    if (newAlpha >= .35 && newAlpha <= 1)
      param.alpha = newAlpha;
  }

  mutateColorV3(param) {
    let color = param.value,
      multiple = 100;

    const newColor = color + this.sign() * this.deltaInt() * multiple;
    const newAlpha = param.alpha + this.sign() * this.deltaFloat();

    if (newColor >= 0x0 && newColor <= 0xFFFFFF)
      param.value = newColor;

    if (newAlpha >= .35 && newAlpha <= 1)
      param.alpha = newAlpha;
  }

  mutateColorV4(param) {
    let color = param.value,
      blue = color & 0xFF,
      green = Math.round((color & 0xFF00) / 0x00FF),
      red = Math.round((color & 0xFFFF00) / 0x00FFFF)
    ;

    // console.log('start color mutation');
    // console.log(color.toString(16));

    const normalizeColor = (rawColor) => {
      if (rawColor < 0x0) rawColor = 0;
      if (rawColor > 0xFF) rawColor = 0xFF;
      return rawColor;
    };

    // let multiple = 10;
    let multiple = 1;

    const newBlue = blue + this.sign() * this.deltaInt() * multiple;
    const newRed = red + this.sign() * this.deltaInt() * multiple;
    const newGreen = green + this.sign() * this.deltaInt() * multiple;

    if (newRed <= 0x0 && newRed >= 0xFF) red = newRed;
    if (newGreen <= 0x0 && newGreen >= 0xFF) green = newGreen;
    if (newBlue <= 0x0 && newBlue >= 0xFF) blue = newBlue;

    red = red.toString(16).toUpperCase().padStart(2, '0');
    green = green.toString(16).toUpperCase().padStart(2, '0');
    blue = blue.toString(16).toUpperCase().padStart(2, '0');

    const newColor =
      parseInt('0x' + red.toString(16)[0]) * 16**5 +
      parseInt('0x' + red.toString(16)[1]) * 16**4 +
      parseInt('0x' + green.toString(16)[0]) * 16**3 +
      parseInt('0x' + green.toString(16)[1]) * 16**2 +
      parseInt('0x' + blue.toString(16)[0]) * 16**1 +
      parseInt('0x' + blue.toString(16)[1]) * 16**0;

    let newAlpha = param.alpha + this.sign() * this.deltaFloat();

    if (newColor >= 0x0 && newColor <= 0xFFFFFF)
      param.value = newColor;

    if (newAlpha >= .35 && newAlpha <= 1)
      param.alpha = newAlpha;
  }

  mutateColorV5(param) {
    let color = param.value,
      blue = color & 0xFF,
      green = Math.floor((color & 0xFF00) / 0xFF),
      red = Math.floor((color & 0xFFFF00) / 0xFFFF)
    ;

    let multiple = 1;
    // let multiple = 1;

    const newBlue = blue + this.sign() * this.deltaInt() * multiple;
    const newRed = red + this.sign() * this.deltaInt() * multiple;
    const newGreen = green + this.sign() * this.deltaInt() * multiple;

    red = newRed % 0xFF;
    green = newGreen % 0xFF;
    blue = newBlue % 0xFF;

    const newColor = red * 16 ** 4 + green * 16 ** 2 + blue,
      newAlpha = param.alpha + this.sign() * this.deltaFloat();

    if (newColor >= 0x0 && newColor <= 0xFFFFFF)
      param.value = newColor;

    if (newAlpha >= .35 && newAlpha <= 1)
      param.alpha = newAlpha;
  }

  mutateColorV6(param) {
    let color = param.value,
      blue = color & 0xFF,
      green = Math.floor((color & 0xFF00) / 0xFF),
      red = Math.floor((color & 0xFFFF00) / 0xFFFF)
    ;

    let multiple = 1;

    const newBlue = blue + this.sign() * this.deltaFloat() * multiple;
    const newRed = red + this.sign() * this.deltaFloat() * multiple;
    const newGreen = green + this.sign() * this.deltaFloat() * multiple;

    red = newRed % 0xFF;
    green = newGreen % 0xFF;
    blue = newBlue % 0xFF;

    const newColor = red * 16 ** 4 + green * 16 ** 2 + blue,
      newAlpha = param.alpha + this.sign() * this.deltaFloat();

    if (newColor >= 0x0 && newColor <= 0xFFFFFF)
      param.value = newColor;

    if (newAlpha >= .35 && newAlpha <= 1)
      param.alpha = newAlpha;
  }

  mutateColorV7(param) {
    let color = param.value,
      blue = color & 0xFF,
      green = Math.floor((color & 0xFF00) / 0xFF),
      red = Math.floor((color & 0xFFFF00) / 0xFFFF)
    ;

    let multiple = 1;

    const newBlue = blue + this.sign() * this.deltaFloat() * multiple;
    const newRed = red + this.sign() * this.deltaFloat() * multiple;
    const newGreen = green + this.sign() * this.deltaFloat() * multiple;

    switch (mh.randomInt(1, 3)) {
      case 1:
        red = newRed > 0xFF ? newRed % 0xFF : newRed;
        break;
      case 2:
        green = newGreen > 0xFF ? newGreen % 0xFF : newGreen;
        break;
      case 3:
        blue = newBlue > 0xFF ? newBlue % 0xFF : newBlue;
        break;
    }

    const newColor = red * 16 ** 4 + green * 16 ** 2 + blue,
      newAlpha = param.alpha + this.sign() * this.deltaFloat();

    if (newColor >= 0x0 && newColor <= 0xFFFFFF)
      param.value = newColor;

    if (newAlpha >= .35 && newAlpha <= 1)
      param.alpha = newAlpha;
  }

  mutateColorV8(param) {
    let color = param.value,
      blue = color & 0xFF,
      green = Math.floor((color & 0xFF00) / 0xFF),
      red = Math.floor((color & 0xFFFF00) / 0xFFFF)
    ;

    let multiple = 1;

    const newBlue = Math.floor(blue + this.sign() * this.deltaFloat() * multiple);
    const newRed = Math.floor(red + this.sign() * this.deltaFloat() * multiple);
    const newGreen = Math.floor(green + this.sign() * this.deltaFloat() * multiple);

    switch (mh.randomInt(1, 3)) {
      case 1:
        red = newRed > 0xFF ? newRed % 0xFF : newRed;
        break;
      case 2:
        green = newGreen > 0xFF ? newGreen % 0xFF : newGreen;
        break;
      case 3:
        blue = newBlue > 0xFF ? newBlue % 0xFF : newBlue;
        break;
    }

    const newColor = red * 16 ** 4 + green * 16 ** 2 + blue,
      newAlpha = param.alpha + this.sign() * this.deltaFloat();

    if (newColor >= 0x0 && newColor <= 0xFFFFFF)
      param.value = newColor;

    if (newAlpha >= .35 && newAlpha <= 1)
      param.alpha = newAlpha;
  }

}
