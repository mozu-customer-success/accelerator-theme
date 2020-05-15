import semver from 'semver';
import git from './git';

export default function fetchRemoteTags(opts = {}) {
  return git(
    `ls-remote --tags basetheme`,
    `Detecting base theme versions`,
    {
      quiet: opts.hasOwnProperty('quiet') ? opts.quiet : true,
      logger: opts.logger
    }
  ).then(tags => {
    let uniques = new Set();
    return tags
    .trim()
    .split('\n')
    .map(l => {
      let m = l.match(/([0-9A-Fa-f]+)\trefs\/tags\/v?([^\^]+)\^\{\}/i);
      if (m) {
        let version = semver.clean(m[2]);
        if (!uniques.has(version)) {
          uniques.add(version);
          return {
            commit: m[1],
            version: version
          };
        }
      }
    })
    .filter(opts.prerelease ? 
      x => !!x && !!x.version
      :
      x => !!x && !!x.version && !~x.version.indexOf('-')
    )
    .sort((x, y) => semver.rcompare(x.version, y.version));
  });
};
