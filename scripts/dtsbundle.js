require('dts-generator').generate({
  name: 'phosphor-domutil',
  main: 'phosphor-domutil/index',
  baseDir: 'lib',
  files: ['index.d.ts'],
  out: 'lib/phosphor-domutil.d.ts',
});
