let mh = mathHelper = {
  deg2Rad: (deg, pi = Math.PI, divider = 180) => {
    return (
      pi
      // Math.PI * 1.4
      // Math.PI * 15
      // Math.PI * 2
      /*
      // 11071995 // Ингвар
      // 1.618034 // золотое сечение
      // 21091982 // А
      // 15061982 // И
       */
      * deg) / divider;
  },
  cosDeg: (deg, pi = Math.PI, divider = 180) => {
    return Math.cos(mathHelper.deg2Rad(deg, pi, divider));
    // return Math.sin(mathHelper.deg2Rad(deg, pi, divider));
  },
  sinDeg: (deg, pi = Math.PI, divider = 180) => {
    return Math.sin(mathHelper.deg2Rad(deg, pi, divider));
    // return Math.cos(mathHelper.deg2Rad(deg, pi, divider));
  },
  points2path: (...args) => {
    let path = [];
    args.forEach((point) => {
      path.push(point.x, point.y);
    });
    return path;
  },
  coordSignsByAngle: (angle) => {
    angle = angle % 360;
    return {
      x: angle >= 0 && angle < 180 ? 1 : -1,
      y: angle >= 90 && angle < 270 ? 1 : -1,
    };
  },
  randomInt: (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  randomColor: () => {
    return mh.randomInt(0, 0xFFFFFF);
  }
};
