const fs = require('fs');
const path = require('path');
const program = require('commander');
const lib = require('../lib/main');

program
  .option('-o, --output [output]', 'Filename to output the API responses in JSON format to, otherwise to console')
  .option('-i, --input <input>', 'Folder containing images to describe' )
  .option('-a, --apikey <apikey>', 'Microsoft Vision API Key')
  .option('-l, --limit', 'Limit requests to 20 per minute')
  .parse(process.argv);

const IS_IMAGE = /\.(jpe?g|png|gif|bmp)$/i;

function timeout(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

(async function run()
{
    let images = fs.readdirSync(program.input)
                   .filter(filename => IS_IMAGE.test(filename))
                   .map(filename => path.join(program.input,filename));

    console.log(`fetching ${images.length} image descriptions`);

    let descriptions;
    if(!program.limit)
    {
        descriptions = await lib.describeImages( images, program.apikey );
    }
    else
    {
        // Split array into chunks of 20
        descriptions = { descriptions : [], errors : [] };

        const CHUNK_SIZE = 20;
        const ONE_MINUTE = 60000;
        var i, j, imageChunk;
        for(i=0, j=images.length; i < j; i += CHUNK_SIZE)
        {
            console.log(`Requesting ${CHUNK_SIZE} image descriptions`);
            imageChunk = images.slice(i, i + CHUNK_SIZE);

            var descriptionChunk = await Promise.all([
                lib.describeImages(imageChunk, program.apikey),
                timeout(ONE_MINUTE)
            ]);

            descriptions.descriptions.push(
                ...descriptionChunk[0].descriptions
            );
            descriptions.errors.push(
                ...descriptionChunk[0].errors
            );
        }
    }

    const output = JSON.stringify(descriptions, null, 4);
    fs.writeFileSync(program.output, output);

    console.log( `Finished with ${descriptions.errors.length} bad requests`);
}());
