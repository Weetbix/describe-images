const fs = require('fs');
const path = require('path');
const program = require('commander');
const lib = require('../lib/main');

program
  .option('-o, --output [output]', 'Filename to output the API responses in JSON format to, otherwise to console')
  .option('-i, --input <input>', 'Folder containing images to describe' )
  .option('-a, --apikey <apikey>', 'Microsoft Vision API Key')
  .parse(process.argv);

const IS_IMAGE = /\.(jpe?g|png|gif|bmp)$/i;

(async function run()
{
    let images = fs.readdirSync(program.input)
                   .filter(filename => IS_IMAGE.test(filename))
                   .map(filename => path.join(program.input,filename));

    let descriptions = await lib.describeImages( images, program.apikey );

    console.log( JSON.stringify(descriptions, null, 2) );
}());
