class MultiStar extends Star {
  extraStarList = [];

  constructor(_container, _config) {
    super(_container, _config);

    for (let i = 0; i < _config.extraStar.count.max; i++) {
      this.extraStarList.push(new Star(this.container, _config));
    }
  }

  getStarList() {
    return [this, ...this.extraStarList];
  }

  maxRadius() {
    const starList = [this, ...this.extraStarList];
    let maxRadius = 0;

    starList.forEach((star) => {
      if (star.config.radius.value > maxRadius) {
        maxRadius = star.config.radius.value;
      }
    });

    return maxRadius;
  }

  draw() {
    // console.log('draw');
    const config = this.config;

    this.extraStarList.map(addingStar => addingStar.clear());
    this.extraStarList.slice(0, config.extraStar.count.value).map(addingStar => addingStar.draw());

    super.draw().drawBeautyRatings();

    // Обрезаем всё что выходит за границы
    // const blurSize = 62;
    const maxRadius = this.maxRadius();

    const circle = new PIXI.Graphics()
      .beginFill(0x000000, 0.00001)
      // .beginFill(0x000000, 0.4)
      .drawCircle(config.center.x, config.center.y, maxRadius)
      // .drawCircle(0, 0, config.radius.value)
      .endFill();

    // circle.filters = [new PIXI.filters.BlurFilter(blurSize)];
    // const bounds = new PIXI.Rectangle(this.container.x, this.container.y, maxRadius * 2, maxRadius * 2);

    // Убираем выходящее за пределы
    if (appConfig.hideOutside) {
      this.container.addChild(circle);
      this.container.mask = circle;
    }

    return this;
  }

  calculatePoints() {
    // console.log('calculatePoints');
    super.calculatePoints();

    const
      config = this.config,
      // rayStepCount = config.rayCount.value - 2,
      rayAngle = 360 / config.rayCount.value,
      // rayStepCount = 3,//config.rayCount.value / 1.5,
      rayStep = rayAngle / config.extraStar.count.value;

    this.extraStarList.forEach((addingStar, index) => addingStar.calculatePoints(rayStep * index));

    // this.getStarList().map((star) => star.calculatePoints());
    return this;
  }

  doMutation(mutation, count = 1) {
    super.doMutation(mutation, count);
    this.extraStarList.slice(0, this.config.extraStar.count.value).forEach((addingStar, index) => {
      addingStar.doMutation(mutation, count);
    });

    return this;
  }

  doMutationPoint(/*mutation,*/ count = 1) {
    console.log('doMutationPoint');
    const pointMutator = new Mutator({mutatePoint: true});
    // console.log(pointMutator);
    // console.log('mutate point');
    // console.log(this);

    // console.log(this.externalPointList);

    this.extraStarList.forEach((star) => {
      for (let i = 0; i < count; i++) {
        star.externalPointList.forEach((point) => {
          // pointMutator.doMutation(point);
          pointMutator.doMutation({type: paramType.point,
            ...point});
          // console.log(pointMutator);
        });

        star.internalPointList.forEach((point) => {
          // pointMutator.doMutation({type: paramType.point, ...point});
        });
      }
    });
    return this;
  }

  setCenter(point) {
    const starList = [this, ...this.extraStarList];

    starList.forEach((star) => {
      star.config.center.x = point.x;
      star.config.center.y = point.y;
    });

    return this;
  }

  getConfigList() {
    return this.getStarList().reduce((configList, star) => {
      configList.push(star.config);
      return configList;
    }, []);
  }

  setConfigList(configList) {
    this.getStarList().forEach((star, index) => {
      // console.log(index, value);
      star.config = JSON.parse(JSON.stringify(configList[index]));
    });

    return this;
  }

  packConfigList() {
    return this.getStarList().reduce((configList, star) => {
      if (!star.config) return configList;
      configList.push(star.packConfig());
      return configList;
    }, []);
  }
}
