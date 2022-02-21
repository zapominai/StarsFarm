class Star {
  externalPointList = [];
  internalPointList = [];
  config = {};
  container;
  pointContainer;
  polygonContainer;
  marksContainer;
  beautyRating = 0;
  aiBeautyRating = 0;

  constructor(_container, _config) {
    this.container = _container;
    this.config = JSON.parse(JSON.stringify(_config));
    this.pointContainer = new PIXI.Container();
    this.polygonContainer = new PIXI.Container();
    this.marksContainer = new PIXI.Container();
  }

  static clearContainer(container) {
    if (container.children.length === 0) return;
    container.children.forEach(child => child.destroy());
    container.removeChildren();
  }

  static clearContainers(...containerList) {
    containerList.map(container => Star.clearContainer(container))
  }

  calculatePoints(angleOffset = 0) {
    this.externalPointList = [];
    this.internalPointList = [];

    const config = this.config,
      rayAngle = 360 / config.rayCount.value,
      cos = (angle) => { return mh.cosDeg(angle, config.math.pi.value, config.math.divider.value) },
      sin = (angle) => { return mh.sinDeg(angle, config.math.pi.value, config.math.divider.value) }
      ;

    // Проверка вышла ли точка за пределы контейнера
    const isLegalPoint = (point) => {
      const
        center = config.center,
        x = point.x,
        y = point.y;

      // console.log(this.container.transform.position);
      // console.log(x, y, config.radius.max, center);

      const result = (x > (center.x - config.radius.max)) &&
        (x < (center.x + config.radius.max)) &&
        (y > (center.y - config.radius.max)) &&
        (y < (center.y + config.radius.max));

      // console.log(result);

      return result;
    };

    // console.log(config.math);
    for (let i = 0; i < config.rayCount.value; i++) {
      const currentRayAngle = config.startAngle.value + angleOffset + rayAngle * i,
        coordSings1 = mh.coordSignsByAngle(currentRayAngle),
        newAngle = Math.abs(90 - currentRayAngle % 180);

      // Внешний круг
      const externalPoint = {
        x: config.center.x + coordSings1.x * config.radius.value * cos(newAngle),
        y: config.center.y + coordSings1.y * config.radius.value * sin(newAngle),
      };

      this.externalPointList.push(externalPoint);

      // Внутренний круг
      const getInternalPoint = (currentRayAngle) => {
        const alpha1 = 360 / config.rayCount.value, // угол между лучами
          // текущий угол схождения рёбер
          currentDeepAngle = currentRayAngle + alpha1 / 2,
          beta = alpha1 / 2, // угол в треугольнике ребра
          gamma = config.peakAngle.value, // угол в треугольнике ребра
          alpha2 = 180 - beta - gamma, // угол в треугольнике ребра
          // сторона искомого треугольника
          c = config.radius.value * sin(config.peakAngle.value) / sin(alpha2),
          // угол искомого треугольника
          alpha3 = Math.abs(90 - currentDeepAngle % 180),
          a = c * cos(alpha3),
          b = c * sin(alpha3),
          coordSings2 = mh.coordSignsByAngle(currentDeepAngle);

        return {
          x: this.config.center.x + coordSings2.x * a,
          y: this.config.center.y + coordSings2.y * b
        };
      };

      const internalPoint = getInternalPoint(currentRayAngle);

      this.internalPointList.push(internalPoint);
    }
    return this;
  }

  clear() {
    Star.clearContainers(this.polygonContainer, this.pointContainer, this.marksContainer);
    return this;
  }

  draw() {
    const config = this.config,
      pointGraphics = new PIXI.Graphics(),
      polygonGraphics = new PIXI.Graphics();

    const showPoint = (config, point) => {
      // console.log(config.show);
      if (!config.show.value) return;

      pointGraphics.lineStyle(config.line.width.value,
        config.line.color.value,
        config.line.color.alpha);
      pointGraphics.beginFill(config.fillColor.value, config.fillColor.alpha);
      pointGraphics.drawCircle(point.x, point.y, config.radius.value);
      pointGraphics.endFill();
    };

    Star.clearContainers(this.polygonContainer, this.pointContainer, this.marksContainer);

    function createGradTexture() {
      // adjust it if somehow you need better quality for very very big images
      const quality = 256;
      const canvas = document.createElement('canvas');
      canvas.width = quality;
      canvas.height = 1;

      const ctx = canvas.getContext('2d');

      // use canvas2d API to create gradient
      const grd = ctx.createLinearGradient(0, 0, quality, 0);
      grd.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
      grd.addColorStop(0.3, 'cyan');
      grd.addColorStop(0.7, 'red');
      grd.addColorStop(1, 'green');

      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, quality, 1);

      return PIXI.Texture.from(canvas);
    }

    this.externalPointList.forEach((point, i) => {
      const internalPoint = this.internalPointList[i],
        prevInternalIndex = (i - 1) < 0 ? this.internalPointList.length - 1 : i - 1,
        prevInternalPoint = this.internalPointList[prevInternalIndex];

      const path1 = mh.points2path(config.center, point, internalPoint);
      const path2 = mh.points2path(config.center, point, prevInternalPoint);

      const rayConfig = config.ray,
        lineConfig = rayConfig.line,
        externalPointConfig = config.externalPoint,
        internalPointConfig = config.internalPoint;

      polygonGraphics.lineStyle(lineConfig.width.value,
        lineConfig.color.value,
        lineConfig.color.alpha,
        0);

      polygonGraphics.beginFill(rayConfig.leftFillColor.value,
        rayConfig.leftFillColor.alpha);
      // polygonGraphics.beginTextureFill({texture: createGradTexture()});
      polygonGraphics.drawPolygon(path1);
      polygonGraphics.endFill();

      polygonGraphics.lineStyle(lineConfig.width.value,
        lineConfig.color.value,
        lineConfig.color.alpha,
        1);

      polygonGraphics.beginFill(rayConfig.rightFillColor.value,
        rayConfig.rightFillColor.alpha);
      polygonGraphics.drawPolygon(path2);
      polygonGraphics.endFill();

      // console.log(externalPointConfig.show);
      // showPoint(externalPointConfig, point); // Внешний радиус
      showPoint(internalPointConfig, internalPoint); // Внутренний радиус
    });

    showPoint(config.centralPoint, config.center);

    // console.log(this.container.width);
    this.container.x = config.radius.value + config.center.x - config.radius.value;
    this.container.y = config.radius.value + config.center.y - config.radius.value;
    this.container.pivot.x = config.center.x;
    this.container.pivot.y = config.center.y;
    // console.log(this.container.pivot);

    this.pointContainer.addChild(pointGraphics);
    this.polygonContainer.addChild(polygonGraphics);
    // this.container.addChild(this.pointContainer, this.polygonContainer);
    this.container.addChild(this.polygonContainer, this.pointContainer);

    // this.container.addChild(this.marksContainer);
    // console.log(this.container);

    return this;
  }

  // Выводим оценки
  drawBeautyRatings() {
    Star.clearContainer(this.marksContainer);

    const
      // pointsGraphics = new PIXI.Graphics(),
      config = this.config,
      markPadding = config.radius.max / 2.5
    ;

    const getTextObject = (text) => new PIXI.Text(text, new PIXI.TextStyle({
      fontFamily: 'Segoe UI',
      fontSize: 12
    }));

    const beautyRatingText = getTextObject(this.beautyRating);
    beautyRatingText.x = this.container.x + config.radius.max - markPadding;
    beautyRatingText.y = this.container.y + config.radius.max - markPadding;

    // const aiBeautyRatingText = getTextObject(Math.round(this.aiBeautyRating * 100) / 100);
    const aiBeautyRatingText = getTextObject(this.aiBeautyRating);
    aiBeautyRatingText.x = this.container.x + config.radius.max / 2 - markPadding / 2;
    aiBeautyRatingText.y = this.container.y + config.radius.max - markPadding;

    // pointsGraphics.beginFill(0x000000, 0.5);
    // pointsGraphics.drawCircle(this.container.x + config.radius.max - markPadding,
    //   this.container.y + config.radius.max - markPadding, 10);
    // pointsGraphics.endFill();

    // this.marksContainer.addChild(pointsGraphics);
    // beautyRatingText.addChild(aiBeautyRatingText);

    this.marksContainer.addChild(beautyRatingText);
    this.marksContainer.addChild(aiBeautyRatingText);
    this.container.parent.addChild(this.marksContainer);

    return this;
  }

  doMutation(mutation, count = 1) {
    for (let i = 0; i < count; i++) {
      Object.keys(this.config).forEach((key) => {
        const param = this.config[key];
        mutation(param);
      });
    }
    return this;
  }

  packConfig(parameterObject = {}) {
    let valueList = [];

    // console.log(parameterObject, Object.keys(parameterObject).length);
    const parameterList = Object.keys(parameterObject).length === 0 ? this.config : parameterObject;
    // console.log(parameterList);

    const keys = Object.keys(parameterList);
    // console.log(keys);

    keys.forEach((key) => {
      const parameter = parameterList[key];
      // console.log(key, parameter);

      if (parameter.type === paramType.point) return;

      if (!parameter.hasOwnProperty('value')) {
        // console.log(parameter);
        valueList = valueList.concat(this.packConfig(parameter));
        return;
      }

      if (parameter.type === paramType.bool) {
        valueList.push(parameter.value ? 1 : 0);
      }
      else {
        valueList.push(parameter.value);
      }
    });

    return valueList;
  }
}
