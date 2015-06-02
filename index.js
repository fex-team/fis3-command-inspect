var _ = fis.util;

exports.name = 'inspect [media name]';
exports.desc = 'inspect the result of fis.match ';
exports.options = {
  '-h, --help': 'print this help message',
  '--files'   : 'specify files to be inspected.'
};

exports.run = function(argv, cli) {
  if (argv.h || argv.help) {
    return cli.help(exports.name, exports.options);
  }

  // 如果指定了 media 值
  if (argv._[1]) {
    process.env.NODE_ENV = argv._[1];
  }

  var specified = argv.files;
  var pattern = fis.media().get('project.files');

  if (specified && typeof specified === 'string' && specified !== '::package') {
    pattern = specified.split(/\s*,\s*/);
  }

  var files = fis.project.getSourceByPatterns(pattern);
  var stream = process.stdout;
  var matches = fis.media().getSortedMatches();

  function inspect(value) {
    if (Array.isArray(value)) {
      return '[' + value.map(function(value) {
        if (value && value.__plugin) {
          return ('[plugin `' + value.__plugin + '`]').cyan;
        }

        return value;
      }).join(', ') + ']';
    } else if (value && value.__plugin) {
      return ('[plugin `' + value.__plugin + '`]').cyan;
    }

    return value;
  }

  function output(entry, data) {
    var str = '\n ~ '.bold.yellow;
    var flag = false;

    str += entry + '\n';

    Object.keys(data).forEach(function(key) {
      if (/^__(.*)Index$/.test(key) && RegExp.$1.substr(-1) !== 'F') {
        var propKey = RegExp.$1;
        flag = true;
        str += ' -- ' + propKey + ' ' + inspect(data[propKey]) + ' `' + (matches[data[key]].raw + '').blue + '`   (' + data[key] + 'th)\n';
      }
    });

    if (!flag) {
      str += ' -- empty';
    }
    console.log(str);
  }

  Object.keys(files).forEach(function(subpath) {
    var file = files[subpath];

    output(file.subpath, file);
  });


  var packager = _.applyMatches('::packager', matches, ['prepackager', 'packager', 'spriter', 'postpackager']);
  output('::packager', packager);
};
