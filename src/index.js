import { getOpts, processContentWithOpts } from "static-content-api";
import { loadYaml, saveData } from 'static-content-api/utils.js'

const options = {
  parentDir: 'content',
  outputDir: 'public/data',
}
const opts = getOpts(options)
processContentWithOpts(opts)

loadYaml(opts, 'public/admin/config.yml')
  .then(saveData({ ...opts, jsonArgs: { spaces: 2 } }, 'config'))
  .then(console.log)
