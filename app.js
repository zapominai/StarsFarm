const paramType = {
  int: 0,
  float: 1,
  color: 2,
  point: 3,
  bool: 4,
  object: 5,
};
const appConfig = {
  // rows: 3,
  rows: 10,
  // rows: 6, // Количество строк
  // rows: 20,
  // rows: 50,
  // rows: 1,
  // cols: 10,
  // cols: 40,
  // cols: 1,
  // cols: 2,
  // cols: 3, // Количество столбцов
  cols: 5,

  beautyRatingMax: 5,

  padding: {
    right: 24,
    bottom: 14
  },

  starPadding: {
    left: 10,
    top: 10
  },

  extraStarCountMax: 10, // Максимальное количество дополнительных звёзд
  packedConfigSize: 0,
  hideOutside: true, // Скрывать части звёзд выходящие за её ограничивающий радиус
};

let starList = [];
let doMutation;
let doMutationBatch;
let clearStarList;
let resetPosition;
let app;
const mutator = new Mutator();

delete PIXI.Renderer.__plugins.interaction;

document.addEventListener("DOMContentLoaded",() => {
  const bodySizes = {
      width: document.body.clientWidth,
      height: document.body.clientHeight
    },
    mainContainer = new PIXI.Container(),
    beautyContainer = new PIXI.Container()
  ;

  app = new PIXI.Application({
    width: bodySizes.width,
    height: bodySizes.height,
    antialias: true,
    // backgroundColor: 0xFFFFFF
    // backgroundColor: 0xa78e8e // Бежевый
    backgroundColor: 0xdddddd
  });

  document.body.appendChild(app.view);

  beautyContainer.interactive = true;
  app.stage.addChild(mainContainer);
  app.stage.addChild(beautyContainer);

  mainContainer.sortableChildren = true;

  // Для обработки событий
  app.stage.interactive = true;
  app.stage.hitArea = app.renderer.screen;
  if (!('events' in app.renderer)) {
    app.renderer.addSystem(PIXI.EventSystem, 'events');
  }

  resetPosition = () => {
    let index = 0;
    for (let i = 0; i < appConfig.rows; i++) {
      for (let j = 0; j < appConfig.cols; j++) {
        const startDiameter = startRadius * 2,
          x = startDiameter * i + startRadius + appConfig.starPadding.left * i,
          y = startDiameter * j + startRadius + appConfig.starPadding.top * j;

        starList[index++].setCenter({x, y}).calculatePoints().draw();
      }
    }
  };

  doMutation = (useAi = false) => {
    // console.log('doMutation');
    // const mutationCount = 100,
    // const mutationCount = 10;
    const mutationCount = 1;

    if (useAi) {
      ai.predictAll(starList);

      const maxBeauty = starList.reduce((max, star) => {
        if (star.aiBeautyRating > max) max = star.aiBeautyRating;
        return max;
      }, 0);

      starList.forEach(star => {
        star.beautyRating = star.aiBeautyRating === maxBeauty ? star.aiBeautyRating : 0;
      });
    }

    const starCount = appConfig.rows * appConfig.cols,
      beautyStarList = () => starList.filter((star) => star.beautyRating > 0),
      emptyStarList = () => starList.filter((star) => star.beautyRating === 0),
      freeSlotCount = starCount - beautyStarList().length,
      beautyRatingSum = starList.reduce((beautyRating, star) => beautyRating + star.beautyRating, 0)
      ;

    // console.log(beautyRatingSum, starCount - beautyStarList().length);

    starList.sort((a, b) => b.beautyRating - a.beautyRating);
    beautyStarList().sort((a, b) => b.beautyRating - a.beautyRating);

    beautyStarList().map((star) => {
      const starQuota = Math.floor(star.beautyRating / beautyRatingSum * 100) / 100,
        starQuotaCount = Math.floor(freeSlotCount * starQuota)
      ;

      // console.log(star.beautyRating, starQuota, starQuotaCount, emptyStarList().length);
      const emptyStarListTemp = emptyStarList();

      for (let i = 0; i < starQuotaCount; i++) {
        emptyStarListTemp[i]
          .setConfigList(star.getConfigList())
          .beautyRating = star.beautyRating;
      }
    });

    beautyStarList().length &&
      emptyStarList().map((emptyStar) => emptyStar.setConfigList(beautyStarList()[0].getConfigList()));

    starList.map(star => star.beautyRating = 0);
    // starList.map(star => star.beautyRating = 5);
    starList.map(star => star.aiBeautyRating = 0);

    starList.map((star) =>
      star
        .doMutation(mutator.doMutation, mutationCount)
        .calculatePoints()
        // .doMutationPoint()
        .draw()
      // console.log(star.config.externalPoint.show);
      // console.log(star.config.radius.value);
    );

    resetPosition();

    useAi && ai.predictAll(starList);

    let mutationCountLabel = document.getElementById('mutationCount');
    mutationCountLabel.textContent = (parseInt(mutationCountLabel.textContent) + mutationCount).toString();
  };

  doMutationBatch = (count, useAi = false) => {
    for (let i = 0; i < count; i++) {
      doMutation(useAi);
    }
  };

  const defaultStarConfig = {
    radius: {
      type: paramType.float,
      // name: 'radius',
      value: bodySizes.width / 2, min: 5, max: 100 // 900
    },
    // Угол отклонения линии от вершин звезды
    peakAngle: {
      type: paramType.float,
      // type: paramType.int, // будут дутыши
      value: 14, min: 1, max: 359
    },
    rayCount: {
      type: paramType.int,
      // type: paramType.float,
      value: 7, min: 2, max: 10, mutationChance: 0.01
    },
    startAngle: {
      type: paramType.int,
      // type: paramType.float,
      value: 0, min: 0, max: 359, mutationChance: 0.01
    },
    center: {
      type: paramType.point,
      x: bodySizes.width / 2,
      y: bodySizes.height / 2
    },
    ray: {
      leftFillColor: {
        type: paramType.color,
        // value: 0x00AAAA, alpha: .6,
        value: mh.randomColor(), alpha: .6,
      },
      rightFillColor: {
        type: paramType.color,
        // value: 0x003399, alpha: .6
        value: mh.randomColor(), alpha: .6
      },
      line: {
        width: {
          type: paramType.int,
          value: 1, min: 1, max: 3
        },
        color: {
          type: paramType.color,
          // value: 0x000000, alpha: 1
          value: mh.randomColor(), alpha: 1
        }
      }
    },
    externalPoint: {
      show: {
        type: paramType.bool,
        value: true
      },
      radius: {
        type: paramType.float,
        value: 1, min: 1, max: 150
      },
      line: {
        width: {
          type: paramType.int,
          value: 1, min: 1, max: 3
        },
        color: {
          type: paramType.color,
          value: 0x000000, alpha: .4
        }
      },
      fillColor: {
        type: paramType.color,
        value: 0x000000, alpha: .6
      },
    },
    internalPoint: {
      show: {
        type: paramType.bool,
        // value: mh.randomInt(0, 1) === 0
        value: false
      },
      radius: {
        type: paramType.float,
        value: 1, min: 1, max: 150
      },
      line: {
        width: {
          type: paramType.int,
          value: 1, min: 1, max: 4
        },
        color: {
          type: paramType.color,
          value: 0x000000, alpha: .4
        }
      },
      fillColor: {
        type: paramType.color,
        value: 0x000000, alpha: .6
      },
    },
    centralPoint: {
      show: {
        type: paramType.bool,
        value: true
      },
      radius: {
        type: paramType.float,
        value: 1, min: 1, max: 150
      },
      line: {
        width: {
          type: paramType.int,
          value: 1, min: 1, max: 3
        },
        color: {
          type: paramType.color,
          value: 0x000000, alpha: .4
        }
      },
      fillColor: {
        type: paramType.color,
        value: 0x000000, alpha: .6
      },
    },
    // Количество дополнительных звёзд
    extraStar: {
      count: {
        // type: paramType.float,
        type: paramType.int,
        // value: 9, min: 9, max: 9, mutationChance: 0.01
        // value: 3, min: 3, max: 10, mutationChance: 0.1
        value: 3, min: 3, max: appConfig.extraStarCountMax, mutationChance: 0.1 // Количество необходимо для настройки модели
        // value: 3, min: 3, max: 3, mutationChance: 0.01
        // value: 1, min: 1, max: 4, mutationChance: 0.5
        // value: 0, min: 0, max: 0, mutationChance: 0.01
      }
    },
    math: {
      pi: {
        type: paramType.float,
        // value: Math.PI, min: 3, max: 4, delta: 0.01, mutationChance: 0.01
        // value: Math.PI, min: 3, max: 4, delta: 0.01, mutationChance: 0.01
        // value: Math.PI * 1.2, min: 3, max: 6, delta: 0.02, mutationChance: 0.02
        // value: Math.PI, min: 3, max: 6, delta: 0.02, mutationChance: 0.02
        // value: Math.PI, min: 3, max: 6, delta: 0.1, mutationChance: 0.1 // Слишком резкие изменения
        value: Math.PI, min: 3, max: 6, delta: 0.05, mutationChance: 0.1
      },
      divider: {
        type: paramType.float,
        // value: 180, min: 160, max: 190, delta: 0.01, mutationChance: 0.01
        value: 180, min: 160, max: 190, delta: 0.02, mutationChance: 0.02
        // value: 180, min: 160, max: 190, delta: 0.1, mutationChance: 0.1
        // value: 180, min: 100, max: 290, delta: 1
      }
    }
  };

  const startRadius = (
    (bodySizes.width - appConfig.padding.right
      - appConfig.starPadding.left * appConfig.rows)
    / appConfig.rows
  ) / 2;

  // console.log(bodySizes);

  for (let i = 0; i < appConfig.rows * appConfig.cols; i++) {
    const container = new PIXI.Container(),
      starConfig = {
        center: { type: paramType.point, x: 0, y: 0 },
        radius: { type: paramType.int, name: 'radius',
          // value: startRadius, min: 5, max: 100
          // value: startRadius, min: 5, max: startRadius
          value: startRadius, min: 5, max: startRadius + startRadius / 2
        },
        ray: {
          leftFillColor: {
            type: paramType.color,
            // value: 0x00AAAA, alpha: .6,
            value: mh.randomColor(), alpha: mh.randomInt(350, 1000) / 1000,
          },
          rightFillColor: {
            type: paramType.color,
            // value: 0x003399, alpha: .6
            value: mh.randomColor(), alpha: mh.randomInt(350, 1000) / 1000
          },
          line: {
            width: {
              // type: paramType.int,
              type: paramType.float,
              value: mh.randomInt(0, 1), min: 0, max: 3
            },
            color: {
              type: paramType.color,
              // value: 0x000000, alpha: 1
              value: mh.randomColor(), alpha: mh.randomInt(350, 1000) / 1000
            }
          }
        },
      };

    container.interactive = true; // Чтобы можно было кликать
    mainContainer.addChild(container);

    const resultConfig = {...defaultStarConfig, ...starConfig};
    let multiStar = new MultiStar(container, resultConfig);

    if (i === 0) {
      appConfig.packedConfigSize = multiStar.packConfig().length;
      console.log(appConfig.packedConfigSize);
    }

    // multiStar.beautyRating = 5;
    starList.push(multiStar);
      // .calculatePoints().draw());
  }

  resetPosition();

  // Отображение вделенной звезды
  let currentStarData = null,
    graphics = new PIXI.Graphics(),
    centralCircle = new PIXI.Container(),
    beautyGraphics = new PIXI.Graphics()
  ;

  centralCircle.addChild(graphics);
  mainContainer.addChildAt(centralCircle, 0);

  // Рисуем отметки оценок
  const drawBeautyMarks = (star) => {
    Star.clearContainer(beautyContainer);
    beautyGraphics = new PIXI.Graphics();

    const container = star.container,
      beautyMark = {
        count: appConfig.beautyRatingMax,
        radius: 24,
        padding: 30
      },
      beautyContainerHeight = beautyMark.count * (beautyMark.radius + beautyMark.padding)
    ;


    // let positionDeltaX = (container.width / 2) + 100;
    // let positionDeltaX = defaultStarConfig.radius.max * (Math.min(bodySizes.height, bodySizes.width) / 2);
    // let positionDeltaX = 540;

    let scale = (Math.min(bodySizes.height, bodySizes.width) / (defaultStarConfig.radius.max * 2)) * .85;
    // console.log(defaultStarConfig.radius.max * scale);
    let positionDeltaX = defaultStarConfig.radius.max * scale + 200;


    beautyGraphics.lineStyle(2, 0x000000, 1);
    beautyGraphics.beginFill(0x000000, .85);
    beautyGraphics.drawRect(
      container.x + positionDeltaX - beautyMark.radius * 2 + 4,
      container.y - beautyContainerHeight / 2 - beautyMark.radius - beautyMark.padding,
      beautyMark.padding / 2 + beautyMark.radius * 3,
      beautyMark.count * (beautyMark.radius * 2 + beautyMark.padding));
    beautyGraphics.endFill();

    for (let i = 0; i < beautyMark.count; i++) {
      beautyGraphics.lineStyle(2, 0x000000, 1);
      beautyGraphics.beginFill((i >= (beautyMark.count - star.beautyRating)) ? 0x00CC00 : 0xFFFFFF, .85);
      // beautyGraphics.beginFill(0x00CC00, .85);

      beautyGraphics.drawCircle(
        container.x + positionDeltaX,
        container.y - beautyContainerHeight / 2 + i * (beautyMark.radius + beautyMark.padding),
        beautyMark.radius
      );
      beautyGraphics.endFill();
    }

    const beautyRatingText = new PIXI.Text(star.beautyRating, new PIXI.TextStyle({
      fontFamily: 'Segoe UI',
      fontSize: 18,
      fill: '#ffffff'
    }));

    //(container.width / 2) + 95
    beautyRatingText.x = container.x + positionDeltaX - 5;
    beautyRatingText.y = container.y + (beautyMark.count * (beautyMark.radius * 2 + beautyMark.padding)) / 2 - 40;

    beautyContainer.addChild(beautyGraphics);
    beautyContainer.addChild(beautyRatingText);
  };

  // Глобальный обработчик клика
  app.stage.addEventListener('click', (e) => {
    // console.log(e.target, starList[0].config.container);
    // const scale = 10;

    if (currentStarData && e.target === beautyContainer) {
      const star = currentStarData.star;
      star.beautyRating++;
      // star.beautyRating += 5;
      (star.beautyRating > appConfig.beautyRatingMax) && (star.beautyRating = 0);
      star.drawBeautyRatings();
      drawBeautyMarks(star);
      // console.log(star.beautyRating);
      return;
    }

    if (currentStarData) {
      // Добавляем оценку в набор для обучения
      const star = currentStarData.star,
        packedConfig = star.packConfig(),
        packedConfigList = star.packConfigList();

      console.log(packedConfigList);

      // ai.starConfigList.push(packedConfig);
      // ai.starConfigList.push(packedConfigList);
      ai.starConfigList.push(packedConfigList.flat());
      // const ratingArray = new Array(packedConfig.length);
      // ratingArray[0] = star.beautyRating;

      // ai.starRatingList.push(ratingArray);
      ai.starRatingList.push(star.beautyRating);
      console.log(ai);

      // Возвращаем звезду на место
      const container = currentStarData.star.container;
      container.scale.set(1);
      container.x = currentStarData.old.x;
      container.y = currentStarData.old.y;
      container.zIndex = currentStarData.old.zIndex;
      currentStarData.star.drawBeautyRatings();
      currentStarData = null;
      graphics.clear();
      Star.clearContainer(beautyContainer);
      return;
    }

    starList.map((star) => {
      // console.log(e.target);
      if (e.target === star.container) {
        // console.log(star.config.externalPoint.show);
        // console.log(star.config);
        // console.log(star.config.peakAngle);
        const starListTmp = [star, ...star.extraStarList];

        // console.log(star.config.extraStar.count.value);

        starListTmp.forEach((starTmp) => {

          // console.log(starTmp.container);
          // console.log(starTmp.container.transform.position);
          // console.log(starTmp.externalPointList);
          // console.log(starTmp.internalPointList);
          // console.log(starTmp.config.ray);
          // console.log(starTmp.config, starTmp.container);
          // console.log(starTmp.container.x, starTmp.container.y);
          // console.log(starTmp.config.center);
          // console.log(starTmp.config.extraStar);
          // console.log(starTmp.config.math.pi.value);
          // console.log(starTmp.config.math.divider.value);
        });

        const container = star.container,
          scale = (Math.min(bodySizes.height, bodySizes.width) /
            // (star.config.radius.value * 2)) * .85
            (star.maxRadius() * 2)) * .85
        ;
        currentStarData = {
          star,
          old: {
            zIndex: container.zIndex,
            x: container.x,
            y: container.y
          },
        };

        // graphics.lineStyle(24, 0xAA99CC, .9);
        // graphics.lineStyle(24, 0x0, .3);

        // Центральнйы круг - подложка
        let yCenterPadding = 20;

        graphics.beginFill(0xeeeeee, .9);
        graphics.drawCircle(
          bodySizes.width / 2,
          // bodySizes.height / 2 + star.config.radius.value,
          bodySizes.height / 2 - yCenterPadding,
          container.width / 2 * scale * 1.15
        );
        centralCircle.zIndex = 10;

        // Хайлайтим выделенную звезду
        container.scale.set(scale);
        container.sortableChildren = true;
        container.zIndex = 11;
        container.x = bodySizes.width / 2;
        container.y = bodySizes.height / 2 - yCenterPadding;

        // Вывод точек для оценки
        drawBeautyMarks(currentStarData.star);

        // currentStarData.star.packConfig()
        console.log(currentStarData.star.packConfig());
        // console.log(currentStarData.star.packConfigList());
      }
    });
  });

  // Вращение
  app.ticker.add((delta) => {
    starList.forEach((star) => {
      // console.log(star);
      star.container.rotation += 0.001 * delta;
    });
  });
});
